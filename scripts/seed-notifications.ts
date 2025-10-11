import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function seedNotifications() {
  console.log('🌱 Seeding notifications...')

  // Get a sample user to associate with notifications
  const sampleUser = await prisma.user.findFirst({
    where: { role: 'STUDENT' }
  })

  if (!sampleUser) {
    console.log('No sample user found, skipping notification seeding')
    return
  }

  const notifications = [
    {
      userId: sampleUser.id,
      title: 'Welcome to COREFX!',
      message: 'Welcome to COREFX! Your account has been created successfully. Start exploring our premium trading features.',
      type: 'WELCOME',
      isRead: false,
      actionUrl: '/dashboard'
    },
    {
      userId: sampleUser.id,
      title: 'New Login Detected',
      message: 'Welcome back! You logged in from desktop at ' + new Date().toLocaleString(),
      type: 'LOGIN',
      isRead: false
    },
    {
      userId: sampleUser.id,
      title: 'System Maintenance Completed',
      message: 'Scheduled maintenance has been completed. All services are now running normally.',
      type: 'SYSTEM',
      isRead: true
    },
    {
      userId: sampleUser.id,
      title: 'Profile Updated',
      message: 'Your profile information has been successfully updated.',
      type: 'UPDATE',
      isRead: true
    },
    {
      userId: sampleUser.id,
      title: 'Password Changed',
      message: 'Your password has been successfully changed for security purposes.',
      type: 'SECURITY',
      isRead: true
    },
    {
      userId: sampleUser.id,
      title: 'New Features Available',
      message: 'Check out our latest trading tools and features in the dashboard.',
      type: 'UPDATE',
      isRead: false
    },
    {
      userId: sampleUser.id,
      title: 'Premium Subscription Available',
      message: 'Upgrade to premium to access exclusive trading signals and advanced features.',
      type: 'PROMOTION',
      isRead: false,
      actionUrl: '/pricing'
    },
    {
      userId: sampleUser.id,
      title: 'Account Verification',
      message: 'Your account has been successfully verified. Welcome to premium features!',
      type: 'WELCOME',
      isRead: true
    }
  ]

  for (const notification of notifications) {
    try {
      await prisma.notification.create({
        data: notification
      })
      console.log(`✅ Created notification: ${notification.title}`)
    } catch (error) {
      console.log(`❌ Failed to create notification: ${notification.title}`, error)
    }
  }

  console.log('🎉 Notifications seeding completed!')
}

seedNotifications()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
