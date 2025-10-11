import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthenticatedUserSimpleFix } from '@/lib/simple-auth-fix'
import * as XLSX from 'xlsx'

export async function POST(request: NextRequest) {
  try {
    console.log('=== EXPORT API CALLED ===')
    
    const user = await getAuthenticatedUserSimpleFix(request)
    console.log('User:', user)
    
    if (!user || user.role !== 'SUPERADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { reportType, format, dateRange = '30d' } = await request.json()
    console.log('Request params:', { reportType, format, dateRange })

    if (!reportType || !format) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 })
    }

    // Calculate date range
    const endDate = new Date()
    const startDate = new Date()
    switch (dateRange) {
      case '7d':
        startDate.setDate(endDate.getDate() - 7)
        break
      case '30d':
        startDate.setDate(endDate.getDate() - 30)
        break
      case '90d':
        startDate.setDate(endDate.getDate() - 90)
        break
      case '1y':
        startDate.setFullYear(endDate.getFullYear() - 1)
        break
      default:
        startDate.setDate(endDate.getDate() - 30)
    }

    console.log('Date range:', { startDate, endDate })

    // Fetch report data
    const reportData = await fetchReportData(reportType, startDate, endDate)
    console.log('Report data fetched:', Object.keys(reportData))

    if (format === 'excel') {
      const excelBuffer = await generateExcelReport(reportType, reportData, startDate)
      return new NextResponse(excelBuffer as any, {
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'Content-Disposition': `attachment; filename="${reportType}_report_${startDate.toISOString().split('T')[0]}.xlsx"`
        }
      })
    } else if (format === 'pdf') {
      const pdfBuffer = await generatePDFReport(reportType, reportData, startDate)
      return new NextResponse(pdfBuffer as any, {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="${reportType}_report_${startDate.toISOString().split('T')[0]}.pdf"`
        }
      })
    }

    return NextResponse.json({ error: 'Format not supported' }, { status: 400 })
  } catch (error) {
    console.error('Export error:', error)
    return NextResponse.json({ error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 })
  }
}

async function fetchReportData(reportType: string, startDate: Date, endDate: Date) {
  const baseWhere = {
    createdAt: {
      gte: startDate,
      lte: endDate
    }
  }

  if (reportType === 'full') {
    const [users, orders, signals, courses, brokerRegistrations] = await Promise.all([
      prisma.user.findMany({
        where: baseWhere,
        include: {
          profile: {
            select: {
              country: true,
              firstName: true,
              lastName: true,
              phone: true
            }
          },
          subscription: {
            select: {
              status: true,
              plan: true
            }
          },
          orders: {
            select: {
              amount: true
            }
          }
        }
      }),
      prisma.order.findMany({
        where: baseWhere,
        include: {
          user: {
            select: { name: true, email: true }
          }
        }
      }),
      prisma.signal.findMany({
        where: baseWhere,
        include: {
          users: {
            include: {
              user: {
                select: { name: true, email: true }
              }
            }
          }
        }
      }),
      prisma.courseEnrollment.findMany({
        where: {
          enrolledAt: {
            gte: startDate,
            lte: endDate
          }
        },
        include: {
          course: {
            select: { title: true, priceUSD: true }
          },
          user: {
            select: { name: true, email: true }
          }
        }
      }),
      prisma.brokerRegistration.findMany({
        where: baseWhere,
        include: {
          user: {
            select: { name: true, email: true }
          }
        }
      })
    ])

    // Transform users data for full report
    const transformedUsers = users.map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      country: user.profile?.country || 'N/A',
      firstName: user.profile?.firstName || 'N/A',
      lastName: user.profile?.lastName || 'N/A',
      phone: user.profile?.phone || 'N/A',
      subscriptionStatus: user.subscription?.status || 'None',
      subscriptionPlan: user.subscription?.plan || 'N/A',
      totalSpent: user.orders.reduce((sum, order) => sum + order.amount, 0),
      createdAt: user.createdAt
    }))

    // Transform orders data for full report
    const transformedOrders = orders.map(order => ({
      id: order.id,
      user: order.user,
      type: 'Order',
      amount: order.amount,
      currency: order.currency,
      status: order.status,
      stripeId: order.stripeId,
      createdAt: order.createdAt
    }))

    // Transform signals data for full report
    const transformedSignals = signals.map(signal => ({
      id: signal.id,
      title: signal.title,
      description: signal.description,
      symbol: signal.symbol,
      action: signal.action,
      direction: signal.direction,
      entryPrice: signal.entryPrice,
      targetPrice: signal.takeProfit,
      stopLoss: signal.stopLoss,
      status: signal.status,
      publishedAt: signal.publishedAt,
      createdAt: signal.createdAt,
      user: signal.users[0]?.user || { name: 'N/A', email: 'N/A' }
    }))

    return {
      title: 'Full System Report',
      reports: {
        users: { data: transformedUsers },
        revenue: { data: transformedOrders },
        signals: { data: transformedSignals },
        courses: { data: courses },
        broker: { data: brokerRegistrations }
      }
    }
  }

  switch (reportType) {
    case 'users':
      const users = await prisma.user.findMany({
        where: baseWhere,
        include: {
          profile: {
            select: {
              country: true,
              firstName: true,
              lastName: true,
              phone: true
            }
          },
          subscription: {
            select: {
              status: true,
              plan: true
            }
          },
          orders: {
            select: {
              amount: true
            }
          }
        }
      })
      
      // Transform the data to include calculated fields
      const transformedUsers = users.map(user => ({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        country: user.profile?.country || 'N/A',
        firstName: user.profile?.firstName || 'N/A',
        lastName: user.profile?.lastName || 'N/A',
        phone: user.profile?.phone || 'N/A',
        subscriptionStatus: user.subscription?.status || 'None',
        subscriptionPlan: user.subscription?.plan || 'N/A',
        totalSpent: user.orders.reduce((sum, order) => sum + order.amount, 0),
        createdAt: user.createdAt
      }))
      
      return { title: 'Users Report', data: transformedUsers }

    case 'revenue':
      const orders = await prisma.order.findMany({
        where: baseWhere,
        include: {
          user: {
            select: { name: true, email: true }
          }
        }
      })
      
      // Transform orders data
      const transformedOrders = orders.map(order => ({
        id: order.id,
        user: order.user,
        type: 'Order', // Default type since Order model doesn't have type field
        amount: order.amount,
        currency: order.currency,
        status: order.status,
        stripeId: order.stripeId,
        createdAt: order.createdAt
      }))
      
      return { title: 'Revenue Report', data: transformedOrders }

    case 'signals':
      const signals = await prisma.signal.findMany({
        where: baseWhere,
        include: {
          users: {
            include: {
              user: {
                select: { name: true, email: true }
              }
            }
          }
        }
      })
      
      // Transform signals data to include user information
      const transformedSignals = signals.map(signal => ({
        id: signal.id,
        title: signal.title,
        description: signal.description,
        symbol: signal.symbol,
        action: signal.action,
        direction: signal.direction,
        entryPrice: signal.entryPrice,
        targetPrice: signal.takeProfit,
        stopLoss: signal.stopLoss,
        status: signal.status,
        publishedAt: signal.publishedAt,
        createdAt: signal.createdAt,
        // Get the first user who received this signal (for reporting purposes)
        user: signal.users[0]?.user || { name: 'N/A', email: 'N/A' }
      }))
      
      return { title: 'Signals Report', data: transformedSignals }

    case 'courses':
      const courses = await prisma.courseEnrollment.findMany({
        where: {
          enrolledAt: {
            gte: startDate,
            lte: endDate
          }
        },
        include: {
          course: {
            select: { title: true, priceUSD: true }
          },
          user: {
            select: { name: true, email: true }
          }
        }
      })
      return { title: 'Courses Report', data: courses }

    case 'broker':
      const brokerRegistrations = await prisma.brokerRegistration.findMany({
        where: baseWhere,
        include: {
          user: {
            select: { name: true, email: true }
          }
        }
      })
      return { title: 'Broker Report', data: brokerRegistrations }

    default:
      return { title: 'Report', data: [] }
  }
}

async function generateExcelReport(reportType: string, reportData: any, startDate: Date): Promise<Buffer> {
  try {
    const workbook = XLSX.utils.book_new()

    if (reportType === 'users' || reportType === 'full') {
      await generateUsersExcelSheet(workbook, reportData)
    }
    if (reportType === 'revenue' || reportType === 'full') {
      await generateRevenueExcelSheet(workbook, reportData)
    }
    if (reportType === 'signals' || reportType === 'full') {
      await generateSignalsExcelSheet(workbook, reportData)
    }
    if (reportType === 'courses' || reportType === 'full') {
      await generateCoursesExcelSheet(workbook, reportData)
    }
    if (reportType === 'broker' || reportType === 'full') {
      await generateBrokerExcelSheet(workbook, reportData)
    }

    await generateSummaryExcelSheet(workbook, reportData, startDate)

    const excelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' })
    return excelBuffer
  } catch (error) {
    console.error('Excel generation error:', error)
    throw error
  }
}

async function generateUsersExcelSheet(workbook: XLSX.WorkBook, reportData: any) {
  const data = reportData.reports?.users?.data || reportData.data || []
  
  const mappedData = data.map((user: any) => ({
    'Name': user.name || 'N/A',
    'Email': user.email || 'N/A',
    'Role': user.role || 'N/A',
    'Country': user.country || 'N/A',
    'Subscription': user.subscriptionStatus || 'None',
    'Total Spent': user.totalSpent || 0,
    'Joined Date': user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'
  }))

  const worksheet = XLSX.utils.json_to_sheet(mappedData)
  worksheet['!cols'] = [
    { wch: 25 }, // Name
    { wch: 30 }, // Email
    { wch: 15 }, // Role
    { wch: 15 }, // Country
    { wch: 15 }, // Subscription
    { wch: 12 }, // Total Spent
    { wch: 15 }  // Joined Date
  ]
  worksheet['!autofilter'] = { ref: `A1:G${mappedData.length + 1}` }

  XLSX.utils.book_append_sheet(workbook, worksheet, 'Users Report')
}

async function generateRevenueExcelSheet(workbook: XLSX.WorkBook, reportData: any) {
  const data = reportData.reports?.revenue?.data || reportData.data || []
  
  const mappedData = data.map((order: any) => ({
    'Order ID': order.id,
    'User': order.user?.name || 'N/A',
    'Email': order.user?.email || 'N/A',
    'Type': order.type || 'N/A',
    'Amount': order.amount || 0,
    'Currency': order.currency || 'USD',
    'Status': order.status || 'N/A',
    'Date': order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A'
  }))

  const worksheet = XLSX.utils.json_to_sheet(mappedData)
  worksheet['!cols'] = [
    { wch: 20 }, // Order ID
    { wch: 25 }, // User
    { wch: 30 }, // Email
    { wch: 15 }, // Type
    { wch: 12 }, // Amount
    { wch: 10 }, // Currency
    { wch: 12 }, // Status
    { wch: 15 }  // Date
  ]
  worksheet['!autofilter'] = { ref: `A1:H${mappedData.length + 1}` }

  XLSX.utils.book_append_sheet(workbook, worksheet, 'Revenue Report')
}

async function generateSignalsExcelSheet(workbook: XLSX.WorkBook, reportData: any) {
  const data = reportData.reports?.signals?.data || reportData.data || []
  
  const mappedData = data.map((signal: any) => ({
    'Signal ID': signal.id,
    'User': signal.user?.name || 'N/A',
    'Email': signal.user?.email || 'N/A',
    'Symbol': signal.symbol || 'N/A',
    'Type': signal.type || 'N/A',
    'Entry Price': signal.entryPrice || 0,
    'Target Price': signal.targetPrice || 0,
    'Stop Loss': signal.stopLoss || 0,
    'Status': signal.status || 'N/A',
    'Created': signal.createdAt ? new Date(signal.createdAt).toLocaleDateString() : 'N/A'
  }))

  const worksheet = XLSX.utils.json_to_sheet(mappedData)
  worksheet['!cols'] = [
    { wch: 20 }, // Signal ID
    { wch: 25 }, // User
    { wch: 30 }, // Email
    { wch: 15 }, // Symbol
    { wch: 10 }, // Type
    { wch: 12 }, // Entry Price
    { wch: 12 }, // Target Price
    { wch: 12 }, // Stop Loss
    { wch: 12 }, // Status
    { wch: 15 }  // Created
  ]
  worksheet['!autofilter'] = { ref: `A1:J${mappedData.length + 1}` }

  XLSX.utils.book_append_sheet(workbook, worksheet, 'Signals Report')
}

async function generateCoursesExcelSheet(workbook: XLSX.WorkBook, reportData: any) {
  const data = reportData.reports?.courses?.data || reportData.data || []
  
  const mappedData = data.map((enrollment: any) => ({
    'Enrollment ID': enrollment.id,
    'User': enrollment.user?.name || 'N/A',
    'Email': enrollment.user?.email || 'N/A',
    'Course': enrollment.course?.title || 'N/A',
    'Price': enrollment.course?.priceUSD || 0,
    'Status': enrollment.status || 'N/A',
    'Enrolled': enrollment.createdAt ? new Date(enrollment.createdAt).toLocaleDateString() : 'N/A'
  }))

  const worksheet = XLSX.utils.json_to_sheet(mappedData)
  worksheet['!cols'] = [
    { wch: 20 }, // Enrollment ID
    { wch: 25 }, // User
    { wch: 30 }, // Email
    { wch: 30 }, // Course
    { wch: 12 }, // Price
    { wch: 12 }, // Status
    { wch: 15 }  // Enrolled
  ]
  worksheet['!autofilter'] = { ref: `A1:G${mappedData.length + 1}` }

  XLSX.utils.book_append_sheet(workbook, worksheet, 'Courses Report')
}

async function generateBrokerExcelSheet(workbook: XLSX.WorkBook, reportData: any) {
  const data = reportData.reports?.broker?.data || reportData.data || []
  
  const mappedData = data.map((registration: any) => ({
    'Registration ID': registration.id,
    'User': registration.user?.name || 'N/A',
    'Email': registration.user?.email || 'N/A',
    'Broker': registration.brokerName || 'N/A',
    'Account Type': registration.accountType || 'N/A',
    'Status': registration.status || 'N/A',
    'Registered': registration.createdAt ? new Date(registration.createdAt).toLocaleDateString() : 'N/A'
  }))

  const worksheet = XLSX.utils.json_to_sheet(mappedData)
  worksheet['!cols'] = [
    { wch: 20 }, // Registration ID
    { wch: 25 }, // User
    { wch: 30 }, // Email
    { wch: 20 }, // Broker
    { wch: 15 }, // Account Type
    { wch: 12 }, // Status
    { wch: 15 }  // Registered
  ]
  worksheet['!autofilter'] = { ref: `A1:G${mappedData.length + 1}` }

  XLSX.utils.book_append_sheet(workbook, worksheet, 'Broker Report')
}

async function generateSummaryExcelSheet(workbook: XLSX.WorkBook, reportData: any, startDate: Date) {
  const summaryData = [
    ['REPORT SUMMARY', '', '', ''],
    ['', '', '', ''],
    ['Report Generated:', new Date().toLocaleString(), '', ''],
    ['Report Period:', `From ${startDate.toISOString().split('T')[0]}`, '', ''],
    ['', '', '', ''],
    ['USERS SUMMARY', '', '', ''],
    ['Total Users:', reportData.reports?.users?.data?.length || reportData.data?.length || 0, '', ''],
    ['', '', '', ''],
    ['REVENUE SUMMARY', '', '', ''],
    ['Total Orders:', reportData.reports?.revenue?.data?.length || 0, '', ''],
    ['Total Revenue:', reportData.reports?.revenue?.data?.reduce((sum: number, order: any) => sum + (order.amount || 0), 0) || 0, '', ''],
    ['', '', '', ''],
    ['SIGNALS SUMMARY', '', '', ''],
    ['Total Signals:', reportData.reports?.signals?.data?.length || 0, '', ''],
    ['', '', '', ''],
    ['COURSES SUMMARY', '', '', ''],
    ['Total Enrollments:', reportData.reports?.courses?.data?.length || 0, '', ''],
    ['', '', '', ''],
    ['BROKER SUMMARY', '', '', ''],
    ['Total Registrations:', reportData.reports?.broker?.data?.length || 0, '', '']
  ]

  const worksheet = XLSX.utils.aoa_to_sheet(summaryData)
  worksheet['!cols'] = [{ wch: 30 }, { wch: 20 }, { wch: 20 }, { wch: 20 }]

  XLSX.utils.book_append_sheet(workbook, worksheet, 'Summary')
}

async function generatePDFReport(reportType: string, reportData: any, startDate: Date): Promise<Buffer> {
  try {
    const { jsPDF } = await import('jspdf')
    const doc = new jsPDF()
  
    // Add title
    doc.setFontSize(20)
    doc.setFont('helvetica', 'bold')
    doc.text(`${reportData.title || 'System Report'}`, 20, 30)
    
    // Add generation info
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text(`Generated: ${new Date().toLocaleString()}`, 20, 45)
    doc.text(`Period: From ${startDate.toISOString().split('T')[0]}`, 20, 55)
    
    let yPosition = 70
    
    if (reportType === 'users' || reportType === 'full') {
      yPosition = addUsersPDFSection(doc, reportData, yPosition)
    }
    
    if (reportType === 'revenue' || reportType === 'full') {
      yPosition = addRevenuePDFSection(doc, reportData, yPosition)
    }
    
    if (reportType === 'signals' || reportType === 'full') {
      yPosition = addSignalsPDFSection(doc, reportData, yPosition)
    }
    
    if (reportType === 'courses' || reportType === 'full') {
      yPosition = addCoursesPDFSection(doc, reportData, yPosition)
    }
    
    if (reportType === 'broker' || reportType === 'full') {
      yPosition = addBrokerPDFSection(doc, reportData, yPosition)
    }
    
    // Add summary section
    addSummaryPDFSection(doc, reportData, startDate)
    
    return Buffer.from(doc.output('arraybuffer'))
  } catch (error) {
    console.error('PDF generation error:', error)
    // Return a simple PDF with error message
    const { jsPDF } = await import('jspdf')
    const doc = new jsPDF()
    doc.setFontSize(16)
    doc.text('PDF Generation Error', 20, 30)
    doc.setFontSize(12)
    doc.text('There was an error generating the PDF report.', 20, 50)
    doc.text('Please try again or contact support.', 20, 60)
    return Buffer.from(doc.output('arraybuffer'))
  }
}

function addUsersPDFSection(doc: any, reportData: any, yPosition: number): number {
  const data = reportData.reports?.users?.data || reportData.data || []
  
  if (data.length === 0) return yPosition
  
  // Add section title
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(25, 118, 210) // Blue
  doc.text('Users Report', 20, yPosition)
  
  let currentY = yPosition + 15
  
  // Headers
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(255, 255, 255)
  doc.setFillColor(25, 118, 210)
  doc.rect(20, currentY - 5, 170, 8, 'F')
  doc.text('Name', 25, currentY)
  doc.text('Email', 60, currentY)
  doc.text('Role', 100, currentY)
  doc.text('Subscription', 130, currentY)
  doc.text('Joined', 160, currentY)
  
  currentY += 10
  
  // Data rows
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(0, 0, 0)
  
  data.slice(0, 20).forEach((user: any, index: number) => {
    if (currentY > 280) {
      doc.addPage()
      currentY = 20
    }
    
    // Alternate row colors
    if (index % 2 === 0) {
      doc.setFillColor(248, 249, 250)
      doc.rect(20, currentY - 3, 170, 6, 'F')
    }
    
    doc.setFontSize(9)
    doc.text((user.name || 'N/A').substring(0, 20), 25, currentY)
    doc.text((user.email || 'N/A').substring(0, 25), 60, currentY)
    doc.text((user.role || 'N/A').substring(0, 10), 100, currentY)
    doc.text((user.subscriptionStatus || 'N/A').substring(0, 15), 130, currentY)
    doc.text(user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A', 160, currentY)
    
    currentY += 8
  })
  
  if (data.length > 20) {
    doc.setFontSize(8)
    doc.setTextColor(100, 100, 100)
    doc.text(`... and ${data.length - 20} more users`, 25, currentY + 5)
    currentY += 15
  }
  
  return currentY + 10
}

function addRevenuePDFSection(doc: any, reportData: any, yPosition: number): number {
  const data = reportData.reports?.revenue?.data || reportData.data || []
  
  if (data.length === 0) return yPosition
  
  // Add section title
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(46, 125, 50) // Green
  doc.text('Revenue Report', 20, yPosition)
  
  let currentY = yPosition + 15
  
  // Summary metrics
  const totalRevenue = data.reduce((sum: number, order: any) => sum + (order.amount || 0), 0)
  const totalOrders = data.length
  
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(0, 0, 0)
  doc.text(`Total Revenue: $${totalRevenue.toFixed(2)}`, 25, currentY)
  currentY += 8
  doc.text(`Total Orders: ${totalOrders}`, 25, currentY)
  currentY += 15
  
  // Headers
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(255, 255, 255)
  doc.setFillColor(46, 125, 50)
  doc.rect(20, currentY - 5, 170, 8, 'F')
  doc.text('Order ID', 25, currentY)
  doc.text('User', 60, currentY)
  doc.text('Type', 100, currentY)
  doc.text('Amount', 130, currentY)
  doc.text('Date', 160, currentY)
  
  currentY += 10
  
  // Data rows
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(0, 0, 0)
  
  data.slice(0, 15).forEach((order: any, index: number) => {
    if (currentY > 280) {
      doc.addPage()
      currentY = 20
    }
    
    // Alternate row colors
    if (index % 2 === 0) {
      doc.setFillColor(248, 249, 250)
      doc.rect(20, currentY - 3, 170, 6, 'F')
    }
    
    doc.setFontSize(9)
    doc.text((order.id || 'N/A').substring(0, 15), 25, currentY)
    doc.text((order.user?.name || 'N/A').substring(0, 20), 60, currentY)
    doc.text((order.type || 'N/A').substring(0, 10), 100, currentY)
    doc.text(`$${order.amount || 0}`, 130, currentY)
    doc.text(order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A', 160, currentY)
    
    currentY += 8
  })
  
  if (data.length > 15) {
    doc.setFontSize(8)
    doc.setTextColor(100, 100, 100)
    doc.text(`... and ${data.length - 15} more orders`, 25, currentY + 5)
    currentY += 15
  }
  
  return currentY + 10
}

function addSignalsPDFSection(doc: any, reportData: any, yPosition: number): number {
  const data = reportData.reports?.signals?.data || reportData.data || []
  
  if (data.length === 0) return yPosition
  
  // Add section title
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(123, 31, 162) // Purple
  doc.text('Signals Report', 20, yPosition)
  
  let currentY = yPosition + 15
  
  // Headers
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(255, 255, 255)
  doc.setFillColor(123, 31, 162)
  doc.rect(20, currentY - 5, 170, 8, 'F')
  doc.text('Symbol', 25, currentY)
  doc.text('Type', 60, currentY)
  doc.text('Entry', 100, currentY)
  doc.text('Target', 130, currentY)
  doc.text('Status', 160, currentY)
  
  currentY += 10
  
  // Data rows
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(0, 0, 0)
  
  data.slice(0, 15).forEach((signal: any, index: number) => {
    if (currentY > 280) {
      doc.addPage()
      currentY = 20
    }
    
    // Alternate row colors
    if (index % 2 === 0) {
      doc.setFillColor(248, 249, 250)
      doc.rect(20, currentY - 3, 170, 6, 'F')
    }
    
    doc.setFontSize(9)
    doc.text((signal.symbol || 'N/A').substring(0, 15), 25, currentY)
    doc.text((signal.type || 'N/A').substring(0, 10), 60, currentY)
    doc.text(signal.entryPrice || 'N/A', 100, currentY)
    doc.text(signal.targetPrice || 'N/A', 130, currentY)
    doc.text((signal.status || 'N/A').substring(0, 10), 160, currentY)
    
    currentY += 8
  })
  
  if (data.length > 15) {
    doc.setFontSize(8)
    doc.setTextColor(100, 100, 100)
    doc.text(`... and ${data.length - 15} more signals`, 25, currentY + 5)
    currentY += 15
  }
  
  return currentY + 10
}

function addCoursesPDFSection(doc: any, reportData: any, yPosition: number): number {
  const data = reportData.reports?.courses?.data || reportData.data || []
  
  if (data.length === 0) return yPosition
  
  // Add section title
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(245, 124, 0) // Orange
  doc.text('Courses Report', 20, yPosition)
  
  let currentY = yPosition + 15
  
  // Headers
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(255, 255, 255)
  doc.setFillColor(245, 124, 0)
  doc.rect(20, currentY - 5, 170, 8, 'F')
  doc.text('Course', 25, currentY)
  doc.text('User', 80, currentY)
  doc.text('Price', 130, currentY)
  doc.text('Status', 160, currentY)
  
  currentY += 10
  
  // Data rows
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(0, 0, 0)
  
  data.slice(0, 15).forEach((enrollment: any, index: number) => {
    if (currentY > 280) {
      doc.addPage()
      currentY = 20
    }
    
    // Alternate row colors
    if (index % 2 === 0) {
      doc.setFillColor(248, 249, 250)
      doc.rect(20, currentY - 3, 170, 6, 'F')
    }
    
    doc.setFontSize(9)
    doc.text((enrollment.course?.title || 'N/A').substring(0, 30), 25, currentY)
    doc.text((enrollment.user?.name || 'N/A').substring(0, 20), 80, currentY)
    doc.text(`$${enrollment.course?.priceUSD || 0}`, 130, currentY)
    doc.text((enrollment.status || 'N/A').substring(0, 10), 160, currentY)
    
    currentY += 8
  })
  
  if (data.length > 15) {
    doc.setFontSize(8)
    doc.setTextColor(100, 100, 100)
    doc.text(`... and ${data.length - 15} more enrollments`, 25, currentY + 5)
    currentY += 15
  }
  
  return currentY + 10
}

function addBrokerPDFSection(doc: any, reportData: any, yPosition: number): number {
  const data = reportData.reports?.broker?.data || reportData.data || []
  
  if (data.length === 0) return yPosition
  
  // Add section title
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(25, 118, 210) // Blue
  doc.text('Broker Registrations', 20, yPosition)
  
  let currentY = yPosition + 15
  
  // Headers
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(255, 255, 255)
  doc.setFillColor(25, 118, 210)
  doc.rect(20, currentY - 5, 170, 8, 'F')
  doc.text('User', 25, currentY)
  doc.text('Broker', 80, currentY)
  doc.text('Account Type', 130, currentY)
  doc.text('Status', 160, currentY)
  
  currentY += 10
  
  // Data rows
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(0, 0, 0)
  
  data.slice(0, 15).forEach((registration: any, index: number) => {
    if (currentY > 280) {
      doc.addPage()
      currentY = 20
    }
    
    // Alternate row colors
    if (index % 2 === 0) {
      doc.setFillColor(248, 249, 250)
      doc.rect(20, currentY - 3, 170, 6, 'F')
    }
    
    doc.setFontSize(9)
    doc.text((registration.user?.name || 'N/A').substring(0, 20), 25, currentY)
    doc.text((registration.brokerName || 'N/A').substring(0, 20), 80, currentY)
    doc.text((registration.accountType || 'N/A').substring(0, 15), 130, currentY)
    doc.text((registration.status || 'N/A').substring(0, 10), 160, currentY)
    
    currentY += 8
  })
  
  if (data.length > 15) {
    doc.setFontSize(8)
    doc.setTextColor(100, 100, 100)
    doc.text(`... and ${data.length - 15} more registrations`, 25, currentY + 5)
    currentY += 15
  }
  
  return currentY + 10
}

function addSummaryPDFSection(doc: any, reportData: any, startDate: Date) {
  // Add new page for summary
  doc.addPage()
  
  // Title
  doc.setFontSize(18)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(0, 0, 0)
  doc.text('Executive Summary', 20, 30)
  
  let yPosition = 50
  
  // Report details
  doc.setFontSize(12)
  doc.setFont('helvetica', 'normal')
  doc.text(`Report Generated: ${new Date().toLocaleString()}`, 20, yPosition)
  yPosition += 10
  doc.text(`Report Period: From ${startDate.toISOString().split('T')[0]} to ${new Date().toISOString().split('T')[0]}`, 20, yPosition)
  yPosition += 20
  
  // Summary sections
  const sections = [
    {
      title: 'Users Summary',
      data: reportData.reports?.users?.data || reportData.data || [],
      color: [25, 118, 210]
    },
    {
      title: 'Revenue Summary',
      data: reportData.reports?.revenue?.data || [],
      color: [46, 125, 50]
    },
    {
      title: 'Signals Summary',
      data: reportData.reports?.signals?.data || [],
      color: [123, 31, 162]
    },
    {
      title: 'Courses Summary',
      data: reportData.reports?.courses?.data || [],
      color: [245, 124, 0]
    },
    {
      title: 'Broker Summary',
      data: reportData.reports?.broker?.data || [],
      color: [25, 118, 210]
    }
  ]
  
  sections.forEach(section => {
    if (section.data.length > 0) {
      // Section title
      doc.setFontSize(14)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(section.color[0], section.color[1], section.color[2])
      doc.text(section.title, 20, yPosition)
      yPosition += 15
      
      // Section data
      doc.setFontSize(10)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(0, 0, 0)
      
      if (section.title === 'Revenue Summary') {
        const totalRevenue = section.data.reduce((sum: number, order: any) => sum + (order.amount || 0), 0)
        doc.text(`Total Revenue: $${totalRevenue.toFixed(2)}`, 30, yPosition)
        yPosition += 8
        doc.text(`Total Orders: ${section.data.length}`, 30, yPosition)
      } else {
        doc.text(`Total Count: ${section.data.length}`, 30, yPosition)
      }
      
      yPosition += 15
    }
  })
  
  // Footer
  const pageCount = doc.internal.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setFontSize(8)
    doc.setTextColor(100, 100, 100)
    doc.text(`Page ${i} of ${pageCount}`, 20, doc.internal.pageSize.height - 20)
    doc.text(`Generated on ${new Date().toLocaleString()}`, doc.internal.pageSize.width - 100, doc.internal.pageSize.height - 20)
  }
}