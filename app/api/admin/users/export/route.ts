import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthenticatedUserSimple } from '@/lib/auth-simple'

// Force dynamic rendering
export const dynamic = 'force-dynamic'






export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUserSimple(request)
    
    if (!user || !['ADMIN', 'SUPERADMIN'].includes(user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get all users with their profiles and subscriptions
    const users = await prisma.user.findMany({
      include: {
        profile: true,
        subscription: true,
        brokerAccount: true,
        adminProfile: true
      },
      orderBy: { createdAt: 'desc' }
    })

    // Convert to CSV format
    const csvHeaders = [
      'ID',
      'Name',
      'Email',
      'Role',
      'Country',
      'Phone',
      'WhatsApp',
      'Subscription Plan',
      'Subscription Status',
      'Has Mentorship',
      'Last Login',
      'Created At'
    ]

    const csvRows = users.map(user => [
      user.id,
      user.name || '',
      user.email,
      user.role,
      user.profile?.country || '',
      user.profile?.phone || user.adminProfile?.phone || '',
      user.profile?.whatsappNumber || '',
      user.subscription?.plan || '',
      user.subscription?.status || '',
      'No', // No hasMentorship field
      user.lastLoginAt ? new Date(user.lastLoginAt).toISOString() : '',
      new Date(user.createdAt).toISOString()
    ])

    const csvContent = [
      csvHeaders.join(','),
      ...csvRows.map(row => row.map(field => `"${field}"`).join(','))
    ].join('\n')

    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="users-export-${new Date().toISOString().split('T')[0]}.csv"`
      }
    })
  } catch (error) {
    console.error('Error exporting users:', error)
    return NextResponse.json({ error: 'Failed to export users' }, { status: 500 })
  }
}
