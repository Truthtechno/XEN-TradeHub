import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function seedAdminNotifications() {
  console.log('Seeding admin notifications...')

  // Get a sample user to associate with notifications
  const sampleUser = await prisma.user.findFirst({
    where: { role: 'STUDENT' }
  })

  if (!sampleUser) {
    console.log('No sample user found, skipping admin notification seeding')
    return
  }

  const notifications = [
    {
      type: 'USER_REGISTRATION',
      title: 'New User Registration',
      message: `${sampleUser.name || 'New User'} registered for an account`,
      actionUrl: '/admin/users',
      userId: sampleUser.id,
      isRead: false
    },
    {
      type: 'CONTENT_LIKE',
      title: 'Content Engagement',
      message: `${sampleUser.name || 'User'} liked your EUR/USD signal post`,
      actionUrl: '/admin/signals',
      userId: sampleUser.id,
      isRead: false
    },
    {
      type: 'USER_ENGAGEMENT',
      title: 'High Engagement',
      message: 'Your latest course has 50+ new enrollments',
      actionUrl: '/admin/courses',
      userId: sampleUser.id,
      isRead: false
    },
    {
      type: 'CONTENT_COMMENT',
      title: 'New Comment',
      message: `${sampleUser.name || 'User'} commented on your market analysis`,
      actionUrl: '/admin/signals',
      userId: sampleUser.id,
      isRead: false
    },
    {
      type: 'SUBSCRIPTION',
      title: 'Premium Subscription',
      message: `${sampleUser.name || 'User'} upgraded to premium membership`,
      actionUrl: '/admin/users',
      userId: sampleUser.id,
      isRead: false
    },
    {
      type: 'SIGNAL_UPLOAD',
      title: 'Signal Published',
      message: 'Your GBP/USD signal was successfully published',
      actionUrl: '/admin/signals',
      userId: sampleUser.id,
      isRead: true
    },
    {
      type: 'COURSE_UPLOAD',
      title: 'Course Published',
      message: 'Advanced Trading Strategies course is now live',
      actionUrl: '/admin/courses',
      userId: sampleUser.id,
      isRead: true
    },
    {
      type: 'SYSTEM_UPDATE',
      title: 'System Update',
      message: 'Database maintenance completed successfully',
      actionUrl: '/admin/settings',
      userId: sampleUser.id,
      isRead: true
    }
  ]

  for (const notification of notifications) {
    await prisma.notification.create({
      data: notification as any
    })
  }

  console.log('Admin notifications seeded successfully!')
}

seedAdminNotifications()
  .catch((e) => {
    console.error('Error seeding admin notifications:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
