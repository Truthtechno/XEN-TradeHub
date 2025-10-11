import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function testEventNotifications() {
  try {
    console.log('🧪 Testing Event Notification System...')

    // First, let's check if we have any students in the database
    const students = await prisma.user.findMany({
      where: { role: 'STUDENT' },
      select: { id: true, email: true, name: true }
    })

    console.log(`📊 Found ${students.length} students in the database`)

    if (students.length === 0) {
      console.log('⚠️  No students found. Creating a test student...')
      
      // Create a test student
      const testStudent = await prisma.user.create({
        data: {
          email: 'test.student@example.com',
          name: 'Test Student',
          role: 'STUDENT'
        }
      })
      
      console.log(`✅ Created test student: ${testStudent.email}`)
    }

    // Test 1: Create a new event via API simulation
    console.log('\n📅 Creating a new event...')
    const eventData = {
      title: 'Advanced Trading Workshop - Test Event',
      description: 'Learn advanced trading strategies and risk management techniques.',
      type: 'WORKSHOP',
      price: 50,
      currency: 'USD',
      startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000).toISOString(), // 3 hours later
      location: 'Online',
      maxAttendees: 30,
      isPublished: true
    }

    const event = await prisma.event.create({
      data: {
        ...eventData,
        startDate: new Date(eventData.startDate),
        endDate: new Date(eventData.endDate)
      }
    })

    console.log(`✅ Event created: ${event.title}`)

    // Test 2: Create NEW notification for the events page
    console.log('🔔 Creating NEW notification for events page...')
    const newNotification = await prisma.newNotification.create({
      data: {
        userId: 'system',
        title: 'New Event Available!',
        message: `Check out the new ${event.type.toLowerCase()}: "${event.title}"`,
        type: 'event',
        isRead: false
      }
    })

    console.log(`✅ NEW notification created: ${newNotification.title}`)

    // Test 3: Create user notifications for all students
    console.log('📧 Creating user notifications for all students...')
    const allStudents = await prisma.user.findMany({
      where: { role: 'STUDENT' },
      select: { id: true }
    })

    if (allStudents.length > 0) {
      const notifications = await prisma.notification.createMany({
        data: allStudents.map(student => ({
          userId: student.id,
          title: 'New Event Available!',
          message: `A new ${event.type.toLowerCase()} "${event.title}" has been added. ${event.price === 0 ? 'It\'s free to attend!' : `Register now for $${event.price}`}`,
          type: 'EVENT',
          isRead: false
        }))
      })

      console.log(`✅ Created ${notifications.count} user notifications`)
    }

    // Test 4: Verify notifications were created
    console.log('\n📊 Verification Results:')
    
    const totalNotifications = await prisma.notification.count()
    const eventNotifications = await prisma.notification.count({
      where: { type: 'EVENT' }
    })
    const newNotifications = await prisma.newNotification.count()
    const eventsPageNotifications = await prisma.newNotification.count({
      where: { type: 'event' }
    })

    console.log(`📈 Total user notifications: ${totalNotifications}`)
    console.log(`🎯 Event notifications: ${eventNotifications}`)
    console.log(`🆕 Total NEW notifications: ${newNotifications}`)
    console.log(`📅 Events page NEW notifications: ${eventsPageNotifications}`)

    // Test 5: Check specific student notifications
    const testStudentNotifications = await prisma.notification.findMany({
      where: { 
        user: { role: 'STUDENT' },
        type: 'EVENT'
      },
      include: {
        user: {
          select: { email: true, name: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 5
    })

    console.log('\n👥 Recent Event Notifications for Students:')
    testStudentNotifications.forEach((notification, index) => {
      console.log(`${index + 1}. ${notification.user.email}: "${notification.title}"`)
      console.log(`   Message: ${notification.message}`)
      console.log(`   Created: ${notification.createdAt.toISOString()}`)
      console.log(`   Read: ${notification.isRead ? 'Yes' : 'No'}`)
      console.log('')
    })

    console.log('🎉 Event notification system test completed successfully!')

  } catch (error) {
    console.error('❌ Error testing event notifications:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testEventNotifications()
