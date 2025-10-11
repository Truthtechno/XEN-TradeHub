import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function seedNewNotifications() {
  console.log('🌱 Seeding NEW notifications...')

  // Get a sample user to associate with notifications
  const sampleUser = await prisma.user.findFirst({
    where: { role: 'STUDENT' }
  })

  if (!sampleUser) {
    console.log('No sample user found, skipping NEW notification seeding')
    return
  }

  // Create sample NEW notifications
  const notifications = [
    {
      userId: sampleUser.id,
      title: 'New Trading Signals Available',
      message: 'We have added 5 new premium trading signals for this week',
      type: 'signal',
      isRead: false
    },
    {
      userId: sampleUser.id,
      title: 'Updated Resource Library',
      message: 'New educational materials and trading guides have been added',
      type: 'resource',
      isRead: false
    },
    {
      userId: sampleUser.id,
      title: 'Market Forecast Update',
      message: 'Latest market analysis and price predictions are now available',
      type: 'forecast',
      isRead: false
    },
    {
      userId: sampleUser.id,
      title: 'New Course Module',
      message: 'Advanced trading strategies module has been added to the course',
      type: 'course',
      isRead: false
    }
  ]

  for (const notification of notifications) {
    try {
      await prisma.newNotification.create({
        data: notification
      })
      console.log(`✅ Created notification: ${notification.title}`)
    } catch (error) {
      console.log(`❌ Failed to create notification: ${notification.title}`, error)
    }
  }

  console.log('🎉 NEW notifications seeding completed!')
}

seedNewNotifications()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
