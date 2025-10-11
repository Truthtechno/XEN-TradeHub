import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function verifyNotifications() {
  console.log('🔍 Verifying notification system...')

  try {
    // Get a student user
    const student = await prisma.user.findFirst({
      where: { role: 'STUDENT' }
    })

    if (!student) {
      console.log('❌ No student user found.')
      return
    }

    console.log(`✅ Checking notifications for student: ${student.name || student.email}`)

    // Check user notifications
    const userNotifications = await prisma.notification.findMany({
      where: { userId: student.id },
      orderBy: { createdAt: 'desc' },
      take: 10
    })

    console.log(`\n📊 User Notifications (${userNotifications.length} total):`)
    userNotifications.forEach((notification, index) => {
      const status = notification.isRead ? '✅ Read' : '🔴 Unread'
      const timeAgo = new Date(notification.createdAt).toLocaleString()
      console.log(`  ${index + 1}. ${notification.title} ${status}`)
      console.log(`     ${notification.message}`)
      console.log(`     Type: ${notification.type} | Created: ${timeAgo}`)
      console.log('')
    })

    // Check NEW notifications
    const newNotifications = await prisma.newNotification.findMany({
      where: { isRead: false },
      orderBy: { createdAt: 'desc' }
    })

    console.log(`\n📊 NEW Notifications (${newNotifications.length} total):`)
    newNotifications.forEach((notification, index) => {
      const timeAgo = new Date(notification.createdAt).toLocaleString()
      console.log(`  ${index + 1}. ${notification.title}`)
      console.log(`     Type: ${notification.type}`)
      console.log(`     Message: ${notification.message}`)
      console.log(`     Created: ${timeAgo}`)
      console.log('')
    })

    // Check notification counts by type
    const notificationCounts = await prisma.notification.groupBy({
      by: ['type'],
      _count: { id: true },
      where: { userId: student.id }
    })

    console.log('📈 Notification counts by type:')
    notificationCounts.forEach(count => {
      console.log(`  - ${count.type}: ${count._count.id}`)
    })

    // Check unread count
    const unreadCount = await prisma.notification.count({
      where: { 
        userId: student.id,
        isRead: false 
      }
    })

    console.log(`\n🔴 Unread notifications: ${unreadCount}`)

    // Check if there are any course or resource notifications
    const courseNotifications = await prisma.notification.count({
      where: { 
        userId: student.id,
        type: 'COURSE'
      }
    })

    const updateNotifications = await prisma.notification.count({
      where: { 
        userId: student.id,
        type: 'UPDATE'
      }
    })

    console.log(`\n📚 Course notifications: ${courseNotifications}`)
    console.log(`📄 Update notifications (resources): ${updateNotifications}`)

    if (courseNotifications > 0 || updateNotifications > 0) {
      console.log('\n✅ SUCCESS: Course and resource notifications are working!')
    } else {
      console.log('\n⚠️  WARNING: No course or resource notifications found. The system may not be working correctly.')
    }

  } catch (error) {
    console.error('❌ Verification failed:', error)
  } finally {
    await prisma.$disconnect()
  }
}

verifyNotifications()
