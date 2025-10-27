import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthenticatedUserSimpleFix } from '@/lib/simple-auth-fix'
import * as XLSX from 'xlsx'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUserSimpleFix(request)
    
    if (!user || !['SUPERADMIN', 'ADMIN', 'ANALYST', 'EDITOR'].includes(user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { reportType, format, dateRange = 'all' } = await request.json()

    if (!reportType || !format) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 })
    }

    // Calculate start date based on range
    const now = new Date()
    let startDate = new Date(0)
    
    switch (dateRange) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        break
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
        break
      case '1y':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)
        break
      case 'all':
      default:
        startDate = new Date(0)
    }

    // Fetch report data based on type with date filtering
    const reportData = await fetchReportData(reportType, startDate)

    if (format === 'excel') {
      const excelBuffer = generateExcelReport(reportType, reportData)
      return new NextResponse(excelBuffer as any, {
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'Content-Disposition': `attachment; filename="${reportType}_report_${new Date().toISOString().split('T')[0]}.xlsx"`
        }
      })
    }

    return NextResponse.json({ error: 'Format not supported' }, { status: 400 })
  } catch (error) {
    console.error('Export error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: String(error) },
      { status: 500 }
    )
  }
}

async function fetchReportData(reportType: string, startDate: Date) {
  switch (reportType) {
    case 'users':
      return await prisma.user.findMany({
        where: { createdAt: { gte: startDate } },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true
        },
        orderBy: { createdAt: 'desc' }
      })

    case 'copyTrading':
      return await prisma.copyTradingSubscription.findMany({
        where: { createdAt: { gte: startDate } },
        include: {
          user: { select: { name: true, email: true } },
          platform: { select: { name: true } }
        },
        orderBy: { createdAt: 'desc' }
      })

    case 'academy':
      return await prisma.academyClassRegistration.findMany({
        where: { createdAt: { gte: startDate } },
        include: {
          user: { select: { name: true, email: true } },
          academyClass: { select: { title: true } }
        },
        orderBy: { createdAt: 'desc' }
      })

    case 'affiliates':
      return await prisma.affiliateProgram.findMany({
        where: { createdAt: { gte: startDate } },
        include: {
          user: { select: { name: true, email: true } }
        },
        orderBy: { createdAt: 'desc' }
      })

    case 'broker':
      return await prisma.brokerAccountOpening.findMany({
        where: { createdAt: { gte: startDate } },
        include: {
          user: { select: { name: true, email: true } },
          broker: { select: { name: true } }
        },
        orderBy: { createdAt: 'desc' }
      })

    case 'revenue':
      const [orders, academyRev] = await Promise.all([
        prisma.order.findMany({
          where: { 
            status: 'COMPLETED',
            createdAt: { gte: startDate }
          },
          include: { user: { select: { name: true, email: true } } },
          orderBy: { createdAt: 'desc' }
        }),
        prisma.academyClassRegistration.findMany({
          where: { 
            status: 'CONFIRMED',
            createdAt: { gte: startDate }
          },
          include: {
            user: { select: { name: true, email: true } },
            academyClass: { select: { title: true } }
          },
          orderBy: { createdAt: 'desc' }
        })
      ])
      return { orders, academyRev }

    case 'full':
      const [users, copyTrading, academy, affiliates, broker, revenue] = await Promise.all([
        fetchReportData('users', startDate),
        fetchReportData('copyTrading', startDate),
        fetchReportData('academy', startDate),
        fetchReportData('affiliates', startDate),
        fetchReportData('broker', startDate),
        fetchReportData('revenue', startDate)
      ])
      return { users, copyTrading, academy, affiliates, broker, revenue }

    default:
      return []
  }
}

function generateExcelReport(reportType: string, data: any): Buffer {
  const workbook = XLSX.utils.book_new()

  switch (reportType) {
    case 'users':
      addUsersSheet(workbook, data)
      break
    case 'copyTrading':
      addCopyTradingSheet(workbook, data)
      break
    case 'academy':
      addAcademySheet(workbook, data)
      break
    case 'affiliates':
      addAffiliatesSheet(workbook, data)
      break
    case 'broker':
      addBrokerSheet(workbook, data)
      break
    case 'revenue':
      addRevenueSheet(workbook, data)
      break
    case 'full':
      addUsersSheet(workbook, data.users)
      addCopyTradingSheet(workbook, data.copyTrading)
      addAcademySheet(workbook, data.academy)
      addAffiliatesSheet(workbook, data.affiliates)
      addBrokerSheet(workbook, data.broker)
      addRevenueSheet(workbook, data.revenue)
      break
  }

  return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' })
}

function addUsersSheet(workbook: XLSX.WorkBook, data: any[]) {
  // Add title row
  const titleRow = [['USERS REPORT - XEN TRADEHUB']]
  const infoRow = [[`Generated: ${new Date().toLocaleString()} | Total Users: ${data.length}`]]
  const emptyRow = [['']]
  
  const mappedData = data.map(user => ({
    'ID': user.id,
    'Name': user.name || 'N/A',
    'Email': user.email,
    'Role': user.role,
    'Joined Date': new Date(user.createdAt).toLocaleDateString()
  }))

  // Create worksheet with title
  const worksheet = XLSX.utils.aoa_to_sheet(titleRow)
  XLSX.utils.sheet_add_aoa(worksheet, infoRow, { origin: 'A2' })
  XLSX.utils.sheet_add_aoa(worksheet, emptyRow, { origin: 'A3' })
  XLSX.utils.sheet_add_json(worksheet, mappedData, { origin: 'A4' })

  // Set column widths
  worksheet['!cols'] = [
    { wch: 30 }, // ID
    { wch: 25 }, // Name
    { wch: 35 }, // Email
    { wch: 15 }, // Role
    { wch: 18 }  // Joined Date
  ]

  // Style title row (A1)
  if (worksheet['A1']) {
    worksheet['A1'].s = {
      font: { bold: true, sz: 16, color: { rgb: '1976D2' } },
      alignment: { horizontal: 'left', vertical: 'center' }
    }
  }

  // Style info row (A2)
  if (worksheet['A2']) {
    worksheet['A2'].s = {
      font: { italic: true, sz: 10, color: { rgb: '666666' } },
      alignment: { horizontal: 'left' }
    }
  }

  // Style header row (A4:E4)
  const headerCells = ['A4', 'B4', 'C4', 'D4', 'E4']
  headerCells.forEach(cell => {
    if (worksheet[cell]) {
      worksheet[cell].s = {
        font: { bold: true, color: { rgb: 'FFFFFF' } },
        fill: { fgColor: { rgb: '1976D2' } },
        alignment: { horizontal: 'center', vertical: 'center' }
      }
    }
  })

  XLSX.utils.book_append_sheet(workbook, worksheet, 'Users Report')
}

function addCopyTradingSheet(workbook: XLSX.WorkBook, data: any[]) {
  const totalInvestment = data.reduce((sum, sub) => sum + (sub.investmentUSD || 0), 0)
  const totalProfit = data.reduce((sum, sub) => sum + (sub.totalProfit || 0), 0)
  
  const titleRow = [['COPY TRADING REPORT - XEN TRADEHUB']]
  const infoRow = [[`Generated: ${new Date().toLocaleString()} | Total Subscriptions: ${data.length} | Total Investment: $${totalInvestment.toFixed(2)} | Total Profit: $${totalProfit.toFixed(2)}`]]
  const emptyRow = [['']]
  
  const mappedData = data.map(sub => ({
    'User': sub.user?.name || 'N/A',
    'Email': sub.user?.email || 'N/A',
    'Trader': sub.trader?.name || 'N/A',
    'Investment (USD)': `$${(sub.investmentUSD || 0).toFixed(2)}`,
    'Status': sub.status,
    'Start Date': new Date(sub.startDate).toLocaleDateString(),
    'Current Profit': `$${(sub.currentProfit || 0).toFixed(2)}`,
    'Total Profit': `$${(sub.totalProfit || 0).toFixed(2)}`
  }))

  const worksheet = XLSX.utils.aoa_to_sheet(titleRow)
  XLSX.utils.sheet_add_aoa(worksheet, infoRow, { origin: 'A2' })
  XLSX.utils.sheet_add_aoa(worksheet, emptyRow, { origin: 'A3' })
  XLSX.utils.sheet_add_json(worksheet, mappedData, { origin: 'A4' })

  worksheet['!cols'] = [
    { wch: 25 }, // User
    { wch: 35 }, // Email
    { wch: 25 }, // Trader
    { wch: 18 }, // Investment
    { wch: 12 }, // Status
    { wch: 18 }, // Start Date
    { wch: 18 }, // Current Profit
    { wch: 18 }  // Total Profit
  ]

  // Style title
  if (worksheet['A1']) {
    worksheet['A1'].s = {
      font: { bold: true, sz: 16, color: { rgb: '8B5CF6' } },
      alignment: { horizontal: 'left', vertical: 'center' }
    }
  }

  // Style info
  if (worksheet['A2']) {
    worksheet['A2'].s = {
      font: { italic: true, sz: 10, color: { rgb: '666666' } },
      alignment: { horizontal: 'left' }
    }
  }

  // Style headers
  const headerCells = ['A4', 'B4', 'C4', 'D4', 'E4', 'F4', 'G4', 'H4']
  headerCells.forEach(cell => {
    if (worksheet[cell]) {
      worksheet[cell].s = {
        font: { bold: true, color: { rgb: 'FFFFFF' } },
        fill: { fgColor: { rgb: '8B5CF6' } },
        alignment: { horizontal: 'center', vertical: 'center' }
      }
    }
  })

  XLSX.utils.book_append_sheet(workbook, worksheet, 'Copy Trading')
}

function addAcademySheet(workbook: XLSX.WorkBook, data: any[]) {
  const totalRevenue = data.reduce((sum, reg) => sum + (reg.amountUSD || 0), 0)
  
  const titleRow = [['ACADEMY REPORT - XEN TRADEHUB']]
  const infoRow = [[`Generated: ${new Date().toLocaleString()} | Total Registrations: ${data.length} | Total Revenue: $${totalRevenue.toFixed(2)}`]]
  const emptyRow = [['']]
  
  const mappedData = data.map(reg => ({
    'User': reg.user?.name || 'N/A',
    'Email': reg.user?.email || 'N/A',
    'Class': reg.academyClass?.title || 'N/A',
    'Amount (USD)': `$${(reg.amountUSD || 0).toFixed(2)}`,
    'Status': reg.status,
    'Registration Date': new Date(reg.createdAt).toLocaleDateString()
  }))

  const worksheet = XLSX.utils.aoa_to_sheet(titleRow)
  XLSX.utils.sheet_add_aoa(worksheet, infoRow, { origin: 'A2' })
  XLSX.utils.sheet_add_aoa(worksheet, emptyRow, { origin: 'A3' })
  XLSX.utils.sheet_add_json(worksheet, mappedData, { origin: 'A4' })

  worksheet['!cols'] = [
    { wch: 25 }, // User
    { wch: 35 }, // Email
    { wch: 40 }, // Class
    { wch: 18 }, // Amount
    { wch: 15 }, // Status
    { wch: 20 }  // Registration Date
  ]

  if (worksheet['A1']) {
    worksheet['A1'].s = {
      font: { bold: true, sz: 16, color: { rgb: '10B981' } },
      alignment: { horizontal: 'left', vertical: 'center' }
    }
  }

  if (worksheet['A2']) {
    worksheet['A2'].s = {
      font: { italic: true, sz: 10, color: { rgb: '666666' } },
      alignment: { horizontal: 'left' }
    }
  }

  const headerCells = ['A4', 'B4', 'C4', 'D4', 'E4', 'F4']
  headerCells.forEach(cell => {
    if (worksheet[cell]) {
      worksheet[cell].s = {
        font: { bold: true, color: { rgb: 'FFFFFF' } },
        fill: { fgColor: { rgb: '10B981' } },
        alignment: { horizontal: 'center', vertical: 'center' }
      }
    }
  })

  XLSX.utils.book_append_sheet(workbook, worksheet, 'Academy')
}

function addAffiliatesSheet(workbook: XLSX.WorkBook, data: any[]) {
  const totalEarnings = data.reduce((sum, aff) => sum + (aff.totalEarnings || 0), 0)
  const totalReferrals = data.reduce((sum, aff) => sum + (aff.totalReferrals || 0), 0)
  
  const titleRow = [['AFFILIATES REPORT - XEN TRADEHUB']]
  const infoRow = [[`Generated: ${new Date().toLocaleString()} | Total Affiliates: ${data.length} | Total Earnings: $${totalEarnings.toFixed(2)} | Total Referrals: ${totalReferrals}`]]
  const emptyRow = [['']]
  
  const mappedData = data.map(aff => ({
    'User': aff.user?.name || 'N/A',
    'Email': aff.user?.email || 'N/A',
    'Affiliate Code': aff.affiliateCode,
    'Tier': aff.tier,
    'Commission Rate': `${aff.commissionRate}%`,
    'Total Earnings': `$${(aff.totalEarnings || 0).toFixed(2)}`,
    'Total Referrals': aff.totalReferrals,
    'Active': aff.isActive ? 'Yes' : 'No',
    'Joined Date': new Date(aff.createdAt).toLocaleDateString()
  }))

  const worksheet = XLSX.utils.aoa_to_sheet(titleRow)
  XLSX.utils.sheet_add_aoa(worksheet, infoRow, { origin: 'A2' })
  XLSX.utils.sheet_add_aoa(worksheet, emptyRow, { origin: 'A3' })
  XLSX.utils.sheet_add_json(worksheet, mappedData, { origin: 'A4' })

  worksheet['!cols'] = [
    { wch: 25 }, // User
    { wch: 35 }, // Email
    { wch: 22 }, // Affiliate Code
    { wch: 12 }, // Tier
    { wch: 18 }, // Commission Rate
    { wch: 18 }, // Total Earnings
    { wch: 18 }, // Total Referrals
    { wch: 10 }, // Active
    { wch: 18 }  // Joined Date
  ]

  if (worksheet['A1']) {
    worksheet['A1'].s = {
      font: { bold: true, sz: 16, color: { rgb: 'F59E0B' } },
      alignment: { horizontal: 'left', vertical: 'center' }
    }
  }

  if (worksheet['A2']) {
    worksheet['A2'].s = {
      font: { italic: true, sz: 10, color: { rgb: '666666' } },
      alignment: { horizontal: 'left' }
    }
  }

  const headerCells = ['A4', 'B4', 'C4', 'D4', 'E4', 'F4', 'G4', 'H4', 'I4']
  headerCells.forEach(cell => {
    if (worksheet[cell]) {
      worksheet[cell].s = {
        font: { bold: true, color: { rgb: 'FFFFFF' } },
        fill: { fgColor: { rgb: 'F59E0B' } },
        alignment: { horizontal: 'center', vertical: 'center' }
      }
    }
  })

  XLSX.utils.book_append_sheet(workbook, worksheet, 'Affiliates')
}

function addBrokerSheet(workbook: XLSX.WorkBook, data: any[]) {
  const titleRow = [['BROKER ACCOUNTS REPORT - XEN TRADEHUB']]
  const infoRow = [[`Generated: ${new Date().toLocaleString()} | Total Accounts: ${data.length}`]]
  const emptyRow = [['']]
  
  const mappedData = data.map(acc => ({
    'User': acc.user?.name || 'N/A',
    'Email': acc.user?.email || 'N/A',
    'Broker': acc.broker?.name || 'N/A',
    'Status': acc.status,
    'Created Date': new Date(acc.createdAt).toLocaleDateString()
  }))

  const worksheet = XLSX.utils.aoa_to_sheet(titleRow)
  XLSX.utils.sheet_add_aoa(worksheet, infoRow, { origin: 'A2' })
  XLSX.utils.sheet_add_aoa(worksheet, emptyRow, { origin: 'A3' })
  XLSX.utils.sheet_add_json(worksheet, mappedData, { origin: 'A4' })

  worksheet['!cols'] = [
    { wch: 25 }, // User
    { wch: 35 }, // Email
    { wch: 25 }, // Broker
    { wch: 15 }, // Status
    { wch: 20 }  // Created Date
  ]

  if (worksheet['A1']) {
    worksheet['A1'].s = {
      font: { bold: true, sz: 16, color: { rgb: '3B82F6' } },
      alignment: { horizontal: 'left', vertical: 'center' }
    }
  }

  if (worksheet['A2']) {
    worksheet['A2'].s = {
      font: { italic: true, sz: 10, color: { rgb: '666666' } },
      alignment: { horizontal: 'left' }
    }
  }

  const headerCells = ['A4', 'B4', 'C4', 'D4', 'E4']
  headerCells.forEach(cell => {
    if (worksheet[cell]) {
      worksheet[cell].s = {
        font: { bold: true, color: { rgb: 'FFFFFF' } },
        fill: { fgColor: { rgb: '3B82F6' } },
        alignment: { horizontal: 'center', vertical: 'center' }
      }
    }
  })

  XLSX.utils.book_append_sheet(workbook, worksheet, 'Broker Accounts')
}

function addRevenueSheet(workbook: XLSX.WorkBook, data: any) {
  const orders = data.orders || []
  const academyRev = data.academyRev || []

  const totalOrderRevenue = orders.reduce((sum: number, order: any) => sum + (order.amount || 0), 0)
  const totalAcademyRevenue = academyRev.reduce((sum: number, reg: any) => sum + (reg.amountUSD || 0), 0)
  const totalRevenue = totalOrderRevenue + totalAcademyRevenue

  const titleRow = [['REVENUE REPORT - XEN TRADEHUB']]
  const infoRow = [[`Generated: ${new Date().toLocaleString()} | Total Transactions: ${orders.length + academyRev.length} | Total Revenue: $${totalRevenue.toFixed(2)} (Orders: $${totalOrderRevenue.toFixed(2)} | Academy: $${totalAcademyRevenue.toFixed(2)})`]]
  const emptyRow = [['']]

  const mappedOrders = orders.map((order: any) => ({
    'Source': 'Order',
    'User': order.user?.name || 'N/A',
    'Email': order.user?.email || 'N/A',
    'Amount': `$${(order.amount || 0).toFixed(2)}`,
    'Currency': order.currency,
    'Status': order.status,
    'Date': new Date(order.createdAt).toLocaleDateString()
  }))

  const mappedAcademy = academyRev.map((reg: any) => ({
    'Source': 'Academy',
    'User': reg.user?.name || 'N/A',
    'Email': reg.user?.email || 'N/A',
    'Amount': `$${(reg.amountUSD || 0).toFixed(2)}`,
    'Currency': 'USD',
    'Status': reg.status,
    'Date': new Date(reg.createdAt).toLocaleDateString()
  }))

  const allRevenue = [...mappedOrders, ...mappedAcademy]

  const worksheet = XLSX.utils.aoa_to_sheet(titleRow)
  XLSX.utils.sheet_add_aoa(worksheet, infoRow, { origin: 'A2' })
  XLSX.utils.sheet_add_aoa(worksheet, emptyRow, { origin: 'A3' })
  XLSX.utils.sheet_add_json(worksheet, allRevenue, { origin: 'A4' })

  worksheet['!cols'] = [
    { wch: 15 }, // Source
    { wch: 25 }, // User
    { wch: 35 }, // Email
    { wch: 18 }, // Amount
    { wch: 12 }, // Currency
    { wch: 15 }, // Status
    { wch: 18 }  // Date
  ]

  if (worksheet['A1']) {
    worksheet['A1'].s = {
      font: { bold: true, sz: 16, color: { rgb: 'EF4444' } },
      alignment: { horizontal: 'left', vertical: 'center' }
    }
  }

  if (worksheet['A2']) {
    worksheet['A2'].s = {
      font: { italic: true, sz: 10, color: { rgb: '666666' } },
      alignment: { horizontal: 'left' }
    }
  }

  const headerCells = ['A4', 'B4', 'C4', 'D4', 'E4', 'F4', 'G4']
  headerCells.forEach(cell => {
    if (worksheet[cell]) {
      worksheet[cell].s = {
        font: { bold: true, color: { rgb: 'FFFFFF' } },
        fill: { fgColor: { rgb: 'EF4444' } },
        alignment: { horizontal: 'center', vertical: 'center' }
      }
    }
  })

  XLSX.utils.book_append_sheet(workbook, worksheet, 'Revenue')
}
