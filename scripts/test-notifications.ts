import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function testNotifications() {
  console.log('🧪 Testing notification system...')

  try {
    // Get an admin user
    const admin = await prisma.user.findFirst({
      where: { role: 'SUPERADMIN' }
    })

    if (!admin) {
      console.log('❌ No admin user found. Please create an admin user first.')
      return
    }

    console.log(`✅ Found admin user: ${admin.name || admin.email}`)

    // Get a student user
    const student = await prisma.user.findFirst({
      where: { role: 'STUDENT' }
    })

    if (!student) {
      console.log('❌ No student user found. Please create a student user first.')
      return
    }

    console.log(`✅ Found student user: ${student.name || student.email}`)

    // Test 1: Create a new course
    console.log('\n📚 Creating test course...')
    const course = await prisma.course.create({
      data: {
        title: 'Advanced Forex Trading Strategies',
        slug: 'advanced-forex-strategies',
        description: 'Master advanced trading techniques and risk management strategies for professional forex trading.',
        shortDescription: 'Advanced trading strategies for experienced traders',
        priceUSD: 199.99,
        level: 'ADVANCED',
        status: 'PUBLISHED',
        instructor: 'XEN Forex',
        isFree: false,
        duration: 7200, // 2 hours
        totalLessons: 8,
        views: 0,
        rating: null,
        tags: ['forex', 'advanced', 'trading', 'strategies'],
        coverUrl: null
      }
    })

    console.log(`✅ Course created: ${course.title}`)

    // Test 2: Create a new resource
    console.log('\n📄 Creating test resource...')
    const resource = await prisma.resource.create({
      data: {
        title: 'Market Analysis Report - October 2025',
        slug: 'market-analysis-october-2025',
        description: 'Comprehensive market analysis and trading opportunities for October 2025.',
        type: 'ARTICLE',
        category: 'Analysis',
        url: 'https://example.com/market-analysis-oct-2025',
        thumbnail: null,
        duration: null,
        isPremium: false,
        priceUSD: null,
        tags: ['analysis', 'market', 'october', '2025'],
        publishedAt: new Date()
      }
    })

    console.log(`✅ Resource created: ${resource.title}`)

    // Check notifications created
    console.log('\n🔔 Checking notifications...')
    
    // Check NEW notifications
    const newNotifications = await prisma.newNotification.findMany({
      where: {
        OR: [
          { type: 'course' },
          { type: 'resource' }
        ]
      },
      orderBy: { createdAt: 'desc' }
    })

    console.log(`📊 NEW notifications created: ${newNotifications.length}`)
    newNotifications.forEach(notification => {
      console.log(`  - ${notification.title} (${notification.type})`)
    })

    // Check user notifications
    const userNotifications = await prisma.notification.findMany({
      where: {
        userId: student.id,
        OR: [
          { type: 'COURSE' },
          { type: 'UPDATE' }
        ]
      },
      orderBy: { createdAt: 'desc' }
    })

    console.log(`📊 User notifications for student: ${userNotifications.length}`)
    userNotifications.forEach(notification => {
      console.log(`  - ${notification.title}: ${notification.message}`)
    })

    // Check total notifications in system
    const totalNotifications = await prisma.notification.count()
    const totalNewNotifications = await prisma.newNotification.count()
    
    console.log(`\n📈 System Statistics:`)
    console.log(`  - Total user notifications: ${totalNotifications}`)
    console.log(`  - Total NEW notifications: ${totalNewNotifications}`)
    console.log(`  - Unread notifications for student: ${userNotifications.filter(n => !n.isRead).length}`)

    console.log('\n🎉 Notification system test completed successfully!')
    console.log('\n💡 Next steps:')
    console.log('1. Login as a student user')
    console.log('2. Check the notifications page')
    console.log('3. Look for NEW badges on Courses and Resources in the sidebar')
    console.log('4. Verify notifications appear in the right panel')

  } catch (error) {
    console.error('❌ Test failed:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testNotifications()
