import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedUserSimple } from '@/lib/auth-simple'
import { prisma } from '@/lib/prisma'
import * as XLSX from 'xlsx'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUserSimple(request)
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!['ADMIN', 'SUPERADMIN'].includes(user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { 
      exportType, // 'affiliates', 'payouts', 'referrals', or 'all'
      filters 
    } = body

    console.log('📊 Export request:', { exportType, filters })

    // Fetch filtered data
    const data = await fetchFilteredData(exportType, filters)

    // Generate Excel file
    const excelBuffer = generateExcelReport(exportType, data, filters)

    const filename = `${exportType}_export_${new Date().toISOString().split('T')[0]}.xlsx`

    return new NextResponse(excelBuffer as any, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${filename}"`
      }
    })
  } catch (error) {
    console.error('❌ Export error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

async function fetchFilteredData(exportType: string, filters: any) {
  const { 
    searchTerm = '',
    tierFilter = 'all',
    statusFilter = 'all',
    payoutStatusFilter = 'all',
    paymentMethodFilter = 'all',
    referralStatusFilter = 'all',
    dateFilter = 'all',
    startDate,
    endDate
  } = filters

  // Calculate date range
  const dateRange = getDateRange(dateFilter, startDate, endDate)

  switch (exportType) {
    case 'affiliates':
      return await fetchAffiliates(searchTerm, tierFilter, statusFilter, dateRange)
    
    case 'payouts':
      return await fetchPayouts(searchTerm, payoutStatusFilter, paymentMethodFilter, dateRange)
    
    case 'referrals':
      return await fetchReferrals(searchTerm, referralStatusFilter, dateRange)
    
    case 'all':
      const [affiliates, payouts, referrals] = await Promise.all([
        fetchAffiliates(searchTerm, tierFilter, statusFilter, dateRange),
        fetchPayouts(searchTerm, payoutStatusFilter, paymentMethodFilter, dateRange),
        fetchReferrals(searchTerm, referralStatusFilter, dateRange)
      ])
      return { affiliates, payouts, referrals }
    
    default:
      return []
  }
}

function getDateRange(dateFilter: string, startDate?: string, endDate?: string) {
  const now = new Date()
  
  switch (dateFilter) {
    case 'today':
      const todayStart = new Date(now.setHours(0, 0, 0, 0))
      const todayEnd = new Date(now.setHours(23, 59, 59, 999))
      return { gte: todayStart, lte: todayEnd }
    
    case 'week':
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      return { gte: weekAgo }
    
    case 'month':
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
      return { gte: monthAgo }
    
    case 'custom':
      if (startDate && endDate) {
        return { gte: new Date(startDate), lte: new Date(endDate) }
      }
      return {}
    
    default:
      return {}
  }
}

async function fetchAffiliates(searchTerm: string, tierFilter: string, statusFilter: string, dateRange: any) {
  const where: any = {}

  // Date filter
  if (dateRange.gte || dateRange.lte) {
    where.createdAt = dateRange
  }

  // Tier filter
  if (tierFilter !== 'all') {
    where.tier = tierFilter
  }

  // Status filter
  if (statusFilter !== 'all') {
    where.isActive = statusFilter === 'active'
  }

  // Search filter
  if (searchTerm) {
    where.OR = [
      { user: { name: { contains: searchTerm, mode: 'insensitive' } } },
      { user: { email: { contains: searchTerm, mode: 'insensitive' } } },
      { affiliateCode: { contains: searchTerm, mode: 'insensitive' } },
      { fullName: { contains: searchTerm, mode: 'insensitive' } }
    ]
  }

  return await prisma.affiliateProgram.findMany({
    where,
    include: {
      user: { select: { name: true, email: true } }
    },
    orderBy: { createdAt: 'desc' }
  })
}

async function fetchPayouts(searchTerm: string, statusFilter: string, methodFilter: string, dateRange: any) {
  const where: any = {}

  // Date filter
  if (dateRange.gte || dateRange.lte) {
    where.createdAt = dateRange
  }

  // Status filter
  if (statusFilter !== 'all') {
    where.status = statusFilter
  }

  // Payment method filter
  if (methodFilter !== 'all') {
    where.method = methodFilter
  }

  // Search filter
  if (searchTerm) {
    where.OR = [
      { affiliateProgram: { user: { name: { contains: searchTerm, mode: 'insensitive' } } } },
      { affiliateProgram: { user: { email: { contains: searchTerm, mode: 'insensitive' } } } },
      { affiliateProgram: { affiliateCode: { contains: searchTerm, mode: 'insensitive' } } },
      { transactionId: { contains: searchTerm, mode: 'insensitive' } }
    ]
  }

  return await prisma.affiliatePayout.findMany({
    where,
    include: {
      affiliateProgram: {
        include: {
          user: { select: { name: true, email: true } }
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  })
}

async function fetchReferrals(searchTerm: string, statusFilter: string, dateRange: any) {
  const where: any = {}

  // Date filter
  if (dateRange.gte || dateRange.lte) {
    where.createdAt = dateRange
  }

  // Status filter
  if (statusFilter !== 'all') {
    where.status = statusFilter
  }

  // Search filter
  if (searchTerm) {
    where.OR = [
      { referredUser: { name: { contains: searchTerm, mode: 'insensitive' } } },
      { referredUser: { email: { contains: searchTerm, mode: 'insensitive' } } },
      { affiliateProgram: { affiliateCode: { contains: searchTerm, mode: 'insensitive' } } }
    ]
  }

  return await prisma.affiliateReferral.findMany({
    where,
    include: {
      affiliateProgram: { select: { affiliateCode: true } },
      referredUser: { select: { name: true, email: true } }
    },
    orderBy: { createdAt: 'desc' }
  })
}

function generateExcelReport(exportType: string, data: any, filters: any): Buffer {
  const workbook = XLSX.utils.book_new()

  switch (exportType) {
    case 'affiliates':
      addAffiliatesSheet(workbook, data, filters)
      break
    case 'payouts':
      addPayoutsSheet(workbook, data, filters)
      break
    case 'referrals':
      addReferralsSheet(workbook, data, filters)
      break
    case 'all':
      addAffiliatesSheet(workbook, data.affiliates, filters)
      addPayoutsSheet(workbook, data.payouts, filters)
      addReferralsSheet(workbook, data.referrals, filters)
      break
  }

  return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' })
}

function addAffiliatesSheet(workbook: XLSX.WorkBook, data: any[], filters: any) {
  const totalEarnings = data.reduce((sum, aff) => sum + (aff.totalEarnings || 0), 0)
  const totalPending = data.reduce((sum, aff) => sum + (aff.pendingEarnings || 0), 0)
  const totalPaid = data.reduce((sum, aff) => sum + (aff.paidEarnings || 0), 0)
  const totalReferrals = data.reduce((sum, aff) => sum + (aff.totalReferrals || 0), 0)
  const activeCount = data.filter(aff => aff.isActive).length

  const titleRow = [['AFFILIATE PROGRAMS REPORT - XEN TRADEHUB']]
  const filterInfo = getFilterInfo(filters)
  const infoRow = [[`Generated: ${new Date().toLocaleString()} | Total: ${data.length} (${activeCount} active) | Earnings: $${totalEarnings.toFixed(2)} | Pending: $${totalPending.toFixed(2)} | Paid: $${totalPaid.toFixed(2)} | Referrals: ${totalReferrals}${filterInfo}`]]
  const emptyRow = [['']]

  const mappedData = data.map(aff => ({
    'Full Name': aff.fullName || aff.user?.name || 'N/A',
    'Email': aff.user?.email || 'N/A',
    'Affiliate Code': aff.affiliateCode,
    'Tier': aff.tier,
    'Commission Rate': `${aff.commissionRate}%`,
    'Total Earnings': `$${(aff.totalEarnings || 0).toFixed(2)}`,
    'Pending Earnings': `$${(aff.pendingEarnings || 0).toFixed(2)}`,
    'Paid Earnings': `$${(aff.paidEarnings || 0).toFixed(2)}`,
    'Total Referrals': aff.totalReferrals || 0,
    'Phone': aff.phone || 'N/A',
    'Payment Method': aff.paymentMethod?.replace('_', ' ') || 'N/A',
    'Status': aff.isActive ? 'Active' : 'Inactive',
    'Joined Date': new Date(aff.createdAt).toLocaleDateString()
  }))

  const worksheet = XLSX.utils.aoa_to_sheet(titleRow)
  XLSX.utils.sheet_add_aoa(worksheet, infoRow, { origin: 'A2' })
  XLSX.utils.sheet_add_aoa(worksheet, emptyRow, { origin: 'A3' })
  XLSX.utils.sheet_add_json(worksheet, mappedData, { origin: 'A4' })

  worksheet['!cols'] = [
    { wch: 25 }, // Full Name
    { wch: 35 }, // Email
    { wch: 22 }, // Affiliate Code
    { wch: 12 }, // Tier
    { wch: 18 }, // Commission Rate
    { wch: 18 }, // Total Earnings
    { wch: 18 }, // Pending Earnings
    { wch: 18 }, // Paid Earnings
    { wch: 18 }, // Total Referrals
    { wch: 20 }, // Phone
    { wch: 20 }, // Payment Method
    { wch: 12 }, // Status
    { wch: 18 }  // Joined Date
  ]

  // Style title
  if (worksheet['A1']) {
    worksheet['A1'].s = {
      font: { bold: true, sz: 16, color: { rgb: 'F59E0B' } },
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
  const headerCells = ['A4', 'B4', 'C4', 'D4', 'E4', 'F4', 'G4', 'H4', 'I4', 'J4', 'K4', 'L4', 'M4']
  headerCells.forEach(cell => {
    if (worksheet[cell]) {
      worksheet[cell].s = {
        font: { bold: true, color: { rgb: 'FFFFFF' } },
        fill: { fgColor: { rgb: 'F59E0B' } },
        alignment: { horizontal: 'center', vertical: 'center' }
      }
    }
  })

  XLSX.utils.book_append_sheet(workbook, worksheet, 'Affiliate Programs')
}

function addPayoutsSheet(workbook: XLSX.WorkBook, data: any[], filters: any) {
  const totalAmount = data.reduce((sum, payout) => sum + (payout.amount || 0), 0)
  const completedCount = data.filter(p => p.status === 'COMPLETED').length
  const pendingCount = data.filter(p => p.status === 'PENDING').length

  const titleRow = [['AFFILIATE PAYOUTS REPORT - XEN TRADEHUB']]
  const filterInfo = getFilterInfo(filters)
  const infoRow = [[`Generated: ${new Date().toLocaleString()} | Total: ${data.length} (${completedCount} completed, ${pendingCount} pending) | Total Amount: $${totalAmount.toFixed(2)}${filterInfo}`]]
  const emptyRow = [['']]

  const mappedData = data.map(payout => ({
    'Affiliate Name': payout.affiliateProgram?.fullName || payout.affiliateProgram?.user?.name || 'N/A',
    'Email': payout.affiliateProgram?.user?.email || 'N/A',
    'Affiliate Code': payout.affiliateProgram?.affiliateCode || 'N/A',
    'Amount': `$${(payout.amount || 0).toFixed(2)}`,
    'Payment Method': payout.method?.replace('_', ' ') || 'N/A',
    'Status': payout.status,
    'Transaction ID': payout.transactionId || 'N/A',
    'Notes': payout.notes || 'N/A',
    'Created Date': new Date(payout.createdAt).toLocaleDateString(),
    'Paid Date': payout.paidAt ? new Date(payout.paidAt).toLocaleDateString() : 'N/A'
  }))

  const worksheet = XLSX.utils.aoa_to_sheet(titleRow)
  XLSX.utils.sheet_add_aoa(worksheet, infoRow, { origin: 'A2' })
  XLSX.utils.sheet_add_aoa(worksheet, emptyRow, { origin: 'A3' })
  XLSX.utils.sheet_add_json(worksheet, mappedData, { origin: 'A4' })

  worksheet['!cols'] = [
    { wch: 25 }, // Affiliate Name
    { wch: 35 }, // Email
    { wch: 22 }, // Affiliate Code
    { wch: 15 }, // Amount
    { wch: 20 }, // Payment Method
    { wch: 15 }, // Status
    { wch: 25 }, // Transaction ID
    { wch: 30 }, // Notes
    { wch: 18 }, // Created Date
    { wch: 18 }  // Paid Date
  ]

  // Style title
  if (worksheet['A1']) {
    worksheet['A1'].s = {
      font: { bold: true, sz: 16, color: { rgb: '10B981' } },
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
  const headerCells = ['A4', 'B4', 'C4', 'D4', 'E4', 'F4', 'G4', 'H4', 'I4', 'J4']
  headerCells.forEach(cell => {
    if (worksheet[cell]) {
      worksheet[cell].s = {
        font: { bold: true, color: { rgb: 'FFFFFF' } },
        fill: { fgColor: { rgb: '10B981' } },
        alignment: { horizontal: 'center', vertical: 'center' }
      }
    }
  })

  XLSX.utils.book_append_sheet(workbook, worksheet, 'Affiliate Payouts')
}

function addReferralsSheet(workbook: XLSX.WorkBook, data: any[], filters: any) {
  const convertedCount = data.filter(r => r.status === 'CONVERTED').length
  const pendingCount = data.filter(r => r.status === 'PENDING').length

  const titleRow = [['AFFILIATE REFERRALS REPORT - XEN TRADEHUB']]
  const filterInfo = getFilterInfo(filters)
  const infoRow = [[`Generated: ${new Date().toLocaleString()} | Total: ${data.length} (${convertedCount} converted, ${pendingCount} pending)${filterInfo}`]]
  const emptyRow = [['']]

  const mappedData = data.map(referral => ({
    'Affiliate Code': referral.affiliateProgram?.affiliateCode || 'N/A',
    'Referred User Name': referral.referredUser?.name || 'N/A',
    'Referred User Email': referral.referredUser?.email || 'N/A',
    'Status': referral.status,
    'Registration Date': new Date(referral.createdAt).toLocaleDateString(),
    'Conversion Date': referral.conversionDate ? new Date(referral.conversionDate).toLocaleDateString() : 'N/A'
  }))

  const worksheet = XLSX.utils.aoa_to_sheet(titleRow)
  XLSX.utils.sheet_add_aoa(worksheet, infoRow, { origin: 'A2' })
  XLSX.utils.sheet_add_aoa(worksheet, emptyRow, { origin: 'A3' })
  XLSX.utils.sheet_add_json(worksheet, mappedData, { origin: 'A4' })

  worksheet['!cols'] = [
    { wch: 22 }, // Affiliate Code
    { wch: 25 }, // Referred User Name
    { wch: 35 }, // Referred User Email
    { wch: 15 }, // Status
    { wch: 20 }, // Registration Date
    { wch: 20 }  // Conversion Date
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
  const headerCells = ['A4', 'B4', 'C4', 'D4', 'E4', 'F4']
  headerCells.forEach(cell => {
    if (worksheet[cell]) {
      worksheet[cell].s = {
        font: { bold: true, color: { rgb: 'FFFFFF' } },
        fill: { fgColor: { rgb: '8B5CF6' } },
        alignment: { horizontal: 'center', vertical: 'center' }
      }
    }
  })

  XLSX.utils.book_append_sheet(workbook, worksheet, 'Affiliate Referrals')
}

function getFilterInfo(filters: any): string {
  const parts: string[] = []
  
  if (filters.searchTerm) {
    parts.push(`Search: "${filters.searchTerm}"`)
  }
  if (filters.tierFilter && filters.tierFilter !== 'all') {
    parts.push(`Tier: ${filters.tierFilter}`)
  }
  if (filters.statusFilter && filters.statusFilter !== 'all') {
    parts.push(`Status: ${filters.statusFilter}`)
  }
  if (filters.payoutStatusFilter && filters.payoutStatusFilter !== 'all') {
    parts.push(`Payout Status: ${filters.payoutStatusFilter}`)
  }
  if (filters.paymentMethodFilter && filters.paymentMethodFilter !== 'all') {
    parts.push(`Payment Method: ${filters.paymentMethodFilter}`)
  }
  if (filters.referralStatusFilter && filters.referralStatusFilter !== 'all') {
    parts.push(`Referral Status: ${filters.referralStatusFilter}`)
  }
  if (filters.dateFilter && filters.dateFilter !== 'all') {
    parts.push(`Date: ${filters.dateFilter}`)
  }
  
  return parts.length > 0 ? ` | Filters: ${parts.join(', ')}` : ''
}
