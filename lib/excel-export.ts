import * as XLSX from 'xlsx'

export interface RegistrationData {
  id: string
  fullName: string
  email: string
  phone?: string
  experience?: string
  goals?: string
  status: string
  paymentStatus: string
  amountUSD: number
  currency: string
  createdAt: string
  user?: {
    name?: string
  }
}

export function exportRegistrationsToExcel(
  registrations: RegistrationData[],
  className: string,
  onProgress?: (progress: number) => void
) {
  if (registrations.length === 0) {
    throw new Error('No registrations to export')
  }

  // Create a new workbook
  const workbook = XLSX.utils.book_new()

  // Prepare data with proper formatting
  const formattedData = registrations.map((reg, index) => {
    if (onProgress) {
      onProgress((index / registrations.length) * 100)
    }

    return {
      'Student Name': reg.fullName,
      'Email': reg.email,
      'Phone': reg.phone ? formatPhoneNumber(reg.phone) : 'N/A',
      'Experience Level': reg.experience || 'Not specified',
      'Goals': reg.goals || 'N/A',
      'Registration Status': reg.status,
      'Payment Status': reg.paymentStatus,
      'Amount (USD)': reg.amountUSD,
      'Currency': reg.currency,
      'Registration Date': formatDate(reg.createdAt),
      'User Account': reg.user?.name || 'N/A'
    }
  })

  // Create worksheet
  const worksheet = XLSX.utils.json_to_sheet(formattedData)

  // Set column widths for better readability
  const columnWidths = [
    { wch: 20 }, // Student Name
    { wch: 30 }, // Email
    { wch: 15 }, // Phone
    { wch: 15 }, // Experience Level
    { wch: 25 }, // Goals
    { wch: 18 }, // Registration Status
    { wch: 15 }, // Payment Status
    { wch: 12 }, // Amount (USD)
    { wch: 10 }, // Currency
    { wch: 20 }, // Registration Date
    { wch: 20 }  // User Account
  ]
  worksheet['!cols'] = columnWidths

  // Add professional header styling
  const headerRange = XLSX.utils.decode_range(worksheet['!ref'] || 'A1:K1')
  for (let col = headerRange.s.c; col <= headerRange.e.c; col++) {
    const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col })
    if (!worksheet[cellAddress]) continue
    
    // Professional header styling with gradient effect
    worksheet[cellAddress].s = {
      font: { 
        bold: true, 
        color: { rgb: 'FFFFFF' },
        name: 'Calibri',
        sz: 12
      },
      fill: { 
        fgColor: { rgb: '1E40AF' }, // Professional blue
        patternType: 'solid'
      },
      alignment: { 
        horizontal: 'center', 
        vertical: 'center',
        wrapText: true
      },
      border: {
        top: { style: 'medium', color: { rgb: '1E3A8A' } },
        bottom: { style: 'medium', color: { rgb: '1E3A8A' } },
        left: { style: 'thin', color: { rgb: '3B82F6' } },
        right: { style: 'thin', color: { rgb: '3B82F6' } }
      }
    }
  }

  // Add professional data row styling
  const dataRange = XLSX.utils.decode_range(worksheet['!ref'] || 'A1:K1')
  for (let row = 1; row <= dataRange.e.r; row++) {
    for (let col = dataRange.s.c; col <= dataRange.e.c; col++) {
      const cellAddress = XLSX.utils.encode_cell({ r: row, c: col })
      if (!worksheet[cellAddress]) continue
      
      // Professional alternating row colors
      const isEvenRow = row % 2 === 0
      const baseFillColor = isEvenRow ? 'F8FAFC' : 'FFFFFF' // Subtle blue-tinted white
      
      worksheet[cellAddress].s = {
        font: { 
          name: 'Calibri',
          sz: 11,
          color: { rgb: '1F2937' } // Professional dark gray
        },
        fill: { 
          fgColor: { rgb: baseFillColor },
          patternType: 'solid'
        },
        alignment: { 
          vertical: 'center',
          horizontal: col === 0 ? 'left' : 'center' // Left align names, center everything else
        },
        border: {
          top: { style: 'thin', color: { rgb: 'E2E8F0' } },
          bottom: { style: 'thin', color: { rgb: 'E2E8F0' } },
          left: { style: 'thin', color: { rgb: 'E2E8F0' } },
          right: { style: 'thin', color: { rgb: 'E2E8F0' } }
        }
      }

      // Enhanced formatting for specific columns
      if (col === 0) { // Student Name column
        worksheet[cellAddress].s.font = { 
          name: 'Calibri',
          sz: 11,
          bold: true,
          color: { rgb: '1E40AF' } // Professional blue
        }
      }

      if (col === 1) { // Email column
        worksheet[cellAddress].s.font = { 
          name: 'Calibri',
          sz: 10,
          color: { rgb: '059669' } // Green for emails
        }
      }

      if (col === 5) { // Registration Status column
        const status = worksheet[cellAddress].v
        if (status === 'CONFIRMED') {
          worksheet[cellAddress].s = {
            ...worksheet[cellAddress].s,
            font: { 
              name: 'Calibri',
              sz: 11,
              bold: true,
              color: { rgb: 'FFFFFF' }
            },
            fill: { 
              fgColor: { rgb: '059669' }, // Green background
              patternType: 'solid'
            }
          }
        } else if (status === 'PENDING') {
          worksheet[cellAddress].s = {
            ...worksheet[cellAddress].s,
            font: { 
              name: 'Calibri',
              sz: 11,
              bold: true,
              color: { rgb: 'FFFFFF' }
            },
            fill: { 
              fgColor: { rgb: 'D97706' }, // Orange background
              patternType: 'solid'
            }
          }
        }
      }

      if (col === 6) { // Payment Status column
        const paymentStatus = worksheet[cellAddress].v
        if (paymentStatus === 'PAID') {
          worksheet[cellAddress].s = {
            ...worksheet[cellAddress].s,
            font: { 
              name: 'Calibri',
              sz: 11,
              bold: true,
              color: { rgb: 'FFFFFF' }
            },
            fill: { 
              fgColor: { rgb: '059669' }, // Green background
              patternType: 'solid'
            }
          }
        } else if (paymentStatus === 'PENDING') {
          worksheet[cellAddress].s = {
            ...worksheet[cellAddress].s,
            font: { 
              name: 'Calibri',
              sz: 11,
              bold: true,
              color: { rgb: 'FFFFFF' }
            },
            fill: { 
              fgColor: { rgb: 'D97706' }, // Orange background
              patternType: 'solid'
            }
          }
        }
      }

      if (col === 7) { // Amount column
        worksheet[cellAddress].s = {
          ...worksheet[cellAddress].s,
          font: { 
            name: 'Calibri',
            sz: 11,
            bold: true,
            color: { rgb: '1E40AF' } // Professional blue
          },
          numFmt: '$#,##0.00'
        }
      }

      if (col === 9) { // Registration Date column
        worksheet[cellAddress].s.font = { 
          name: 'Calibri',
          sz: 10,
          color: { rgb: '6B7280' } // Muted gray for dates
        }
      }
    }
  }

  // Add summary sheet
  const summaryData = [
    ['Course Registration Summary', ''],
    ['Course Name', className],
    ['Export Date', new Date().toLocaleString()],
    ['Total Registrations', registrations.length],
    ['Confirmed Registrations', registrations.filter(r => r.status === 'CONFIRMED').length],
    ['Pending Registrations', registrations.filter(r => r.status === 'PENDING').length],
    ['Paid Registrations', registrations.filter(r => r.paymentStatus === 'PAID').length],
    ['Total Revenue', `$${registrations.reduce((acc, r) => acc + r.amountUSD, 0).toFixed(2)}`],
    ['', ''],
    ['Generated by CoreFX Academy Management System', '']
  ]

  const summaryWorksheet = XLSX.utils.aoa_to_sheet(summaryData)
  
  // Professional summary sheet styling
  summaryWorksheet['!cols'] = [{ wch: 35 }, { wch: 25 }]
  
  // Style main title
  summaryWorksheet['A1'].s = {
    font: { 
      bold: true, 
      size: 18, 
      color: { rgb: 'FFFFFF' },
      name: 'Calibri'
    },
    fill: { 
      fgColor: { rgb: '1E40AF' },
      patternType: 'solid'
    },
    alignment: { 
      horizontal: 'center',
      vertical: 'center'
    },
    border: {
      top: { style: 'medium', color: { rgb: '1E3A8A' } },
      bottom: { style: 'medium', color: { rgb: '1E3A8A' } },
      left: { style: 'medium', color: { rgb: '1E3A8A' } },
      right: { style: 'medium', color: { rgb: '1E3A8A' } }
    }
  }

  // Style summary data with professional formatting
  for (let row = 1; row < summaryData.length; row++) {
    const labelCell = XLSX.utils.encode_cell({ r: row, c: 0 })
    const valueCell = XLSX.utils.encode_cell({ r: row, c: 1 })
    
    if (summaryWorksheet[labelCell]) {
      summaryWorksheet[labelCell].s = {
        font: { 
          bold: true,
          name: 'Calibri',
          sz: 12,
          color: { rgb: '1F2937' }
        },
        fill: { 
          fgColor: { rgb: 'F8FAFC' },
          patternType: 'solid'
        },
        alignment: { 
          horizontal: 'left',
          vertical: 'center'
        },
        border: {
          top: { style: 'thin', color: { rgb: 'E2E8F0' } },
          bottom: { style: 'thin', color: { rgb: 'E2E8F0' } },
          left: { style: 'thin', color: { rgb: 'E2E8F0' } },
          right: { style: 'thin', color: { rgb: 'E2E8F0' } }
        }
      }
    }

    if (summaryWorksheet[valueCell]) {
      summaryWorksheet[valueCell].s = {
        font: { 
          name: 'Calibri',
          sz: 12,
          color: { rgb: '1E40AF' }
        },
        fill: { 
          fgColor: { rgb: 'FFFFFF' },
          patternType: 'solid'
        },
        alignment: { 
          horizontal: 'left',
          vertical: 'center'
        },
        border: {
          top: { style: 'thin', color: { rgb: 'E2E8F0' } },
          bottom: { style: 'thin', color: { rgb: 'E2E8F0' } },
          left: { style: 'thin', color: { rgb: 'E2E8F0' } },
          right: { style: 'thin', color: { rgb: 'E2E8F0' } }
        }
      }
    }

    // Special styling for revenue row
    if (row === 7) { // Revenue row
      if (summaryWorksheet[valueCell]) {
        summaryWorksheet[valueCell].s = {
          ...summaryWorksheet[valueCell].s,
          font: { 
            name: 'Calibri',
            sz: 12,
            bold: true,
            color: { rgb: '059669' } // Green for revenue
          }
        }
      }
    }

    // Special styling for system info row
    if (row === 9) { // System info row
      if (summaryWorksheet[labelCell]) {
        summaryWorksheet[labelCell].s = {
          ...summaryWorksheet[labelCell].s,
          font: { 
            name: 'Calibri',
            sz: 10,
            italic: true,
            color: { rgb: '6B7280' } // Muted gray
          }
        }
      }
    }
  }

  // Add professional touches to the main worksheet
  worksheet['!freeze'] = { xSplit: 0, ySplit: 1 } // Freeze header row
  worksheet['!autofilter'] = { ref: `A1:${XLSX.utils.encode_cell({ r: dataRange.e.r, c: dataRange.e.c })}` } // Add autofilter

  // Add worksheets to workbook
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Registrations')
  XLSX.utils.book_append_sheet(workbook, summaryWorksheet, 'Summary')

  // Generate Excel file
  const excelBuffer = XLSX.write(workbook, { 
    bookType: 'xlsx', 
    type: 'array',
    compression: true
  })

  // Create and download file
  const blob = new Blob([excelBuffer], { 
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
  })
  
  const fileName = `${className.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_registrations_${new Date().toISOString().split('T')[0]}.xlsx`
  
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  link.setAttribute('href', url)
  link.setAttribute('download', fileName)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  
  if (onProgress) {
    onProgress(100)
  }
}

function formatPhoneNumber(phone: string): string {
  // Remove any non-digit characters
  const digits = phone.replace(/\D/g, '')
  
  // Format as (XXX) XXX-XXXX for US numbers
  if (digits.length === 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`
  }
  
  // Format as +X (XXX) XXX-XXXX for international numbers
  if (digits.length === 11 && digits.startsWith('1')) {
    return `+1 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`
  }
  
  // Return original if can't format
  return phone
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}
