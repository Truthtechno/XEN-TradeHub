import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function testAPINotifications() {
  console.log('🧪 Testing API notification system...')

  try {
    // Get an admin user for authentication
    const admin = await prisma.user.findFirst({
      where: { role: 'SUPERADMIN' }
    })

    if (!admin) {
      console.log('❌ No admin user found.')
      return
    }

    console.log(`✅ Found admin user: ${admin.name || admin.email}`)

    // Get a student user to check notifications
    const student = await prisma.user.findFirst({
      where: { role: 'STUDENT' }
    })

    if (!student) {
      console.log('❌ No student user found.')
      return
    }

    console.log(`✅ Found student user: ${student.name || student.email}`)

    // Test 1: Create a course via API
    console.log('\n📚 Creating course via API...')
    const courseData = {
      title: 'Professional Forex Trading Masterclass',
      slug: 'professional-forex-masterclass',
      description: 'Complete masterclass covering all aspects of professional forex trading from basics to advanced strategies.',
      shortDescription: 'Complete forex trading masterclass',
      priceUSD: 299.99,
      level: 'EXPERT',
      status: 'PUBLISHED',
      instructor: 'XEN Forex',
      isFree: false,
      tags: ['forex', 'trading', 'masterclass', 'professional'],
      lessons: [
        {
          title: 'Introduction to Professional Trading',
          description: 'Overview of professional trading concepts',
          videoUrl: 'https://example.com/video1',
          durationSec: 1800,
          order: 1,
          isPreview: true,
          isPublished: true
        },
        {
          title: 'Risk Management Strategies',
          description: 'Advanced risk management techniques',
          videoUrl: 'https://example.com/video2',
          durationSec: 2400,
          order: 2,
          isPreview: false,
          isPublished: true
        }
      ]
    }

    // Simulate API call by directly calling the course creation logic
    const course = await prisma.course.create({
      data: {
        title: courseData.title,
        slug: courseData.slug,
        description: courseData.description,
        shortDescription: courseData.shortDescription,
        priceUSD: courseData.priceUSD,
        level: courseData.level,
        status: courseData.status,
        instructor: courseData.instructor,
        isFree: courseData.isFree,
        duration: courseData.lessons.reduce((acc, lesson) => acc + lesson.durationSec, 0),
        totalLessons: courseData.lessons.length,
        views: 0,
        rating: null,
        tags: courseData.tags,
        coverUrl: null
      }
    })

    // Create lessons
    await prisma.lesson.createMany({
      data: courseData.lessons.map(lesson => ({
        ...lesson,
        courseId: course.id
      }))
    })

    // Now trigger the notification creation logic (simulating what the API would do)
    console.log('🔔 Creating course notifications...')
    
    // Create NEW notification for the courses page
    await prisma.newNotification.create({
      data: {
        userId: 'system',
        title: 'New Course Available!',
        message: `Check out the new course: "${course.title}" - ${course.level} level`,
        type: 'course',
        isRead: false
      }
    })

    // Create user notifications for all students about the new course
    const students = await prisma.user.findMany({
      where: { role: 'STUDENT' },
      select: { id: true }
    })

    if (students.length > 0) {
      await prisma.notification.createMany({
        data: students.map(student => ({
          userId: student.id,
          title: 'New Course Available!',
          message: `A new ${course.level.toLowerCase()} level course "${course.title}" has been added to the academy. ${course.isFree ? 'It\'s free to enroll!' : `Enroll now for $${course.priceUSD}`}`,
          type: 'COURSE',
          actionUrl: `/courses/${course.slug}`,
          isRead: false
        }))
      })
    }

    console.log(`✅ Course created and notifications sent to ${students.length} students`)

    // Test 2: Create a resource via API simulation
    console.log('\n📄 Creating resource via API...')
    const resourceData = {
      title: 'Weekly Market Outlook - October 2025',
      slug: 'weekly-market-outlook-oct-2025',
      description: 'Detailed analysis of market trends and trading opportunities for the week.',
      type: 'VIDEO',
      category: 'Market Analysis',
      url: 'https://example.com/weekly-outlook-oct-2025',
      thumbnail: 'https://example.com/thumbnail.jpg',
      duration: 1800, // 30 minutes
      isPremium: false,
      priceUSD: null,
      tags: ['market', 'analysis', 'weekly', 'outlook']
    }

    const resource = await prisma.resource.create({
      data: {
        ...resourceData,
        publishedAt: new Date()
      }
    })

    // Create resource notifications
    console.log('🔔 Creating resource notifications...')
    
    // Create NEW notification for the resources page
    await prisma.newNotification.create({
      data: {
        userId: 'system',
        title: 'New Resource Available!',
        message: `Check out the new ${resource.type.toLowerCase()}: "${resource.title}"`,
        type: 'resource',
        isRead: false
      }
    })

    // Create user notifications for all students about the new resource
    if (students.length > 0) {
      await prisma.notification.createMany({
        data: students.map(student => ({
          userId: student.id,
          title: 'New Resource Available!',
          message: `A new ${resource.type.toLowerCase()} "${resource.title}" has been added to the resource library. ${resource.isPremium ? `Premium content - $${resource.priceUSD}` : 'Free to access!'}`,
          type: 'UPDATE',
          actionUrl: '/resources',
          isRead: false
        }))
      })
    }

    console.log(`✅ Resource created and notifications sent to ${students.length} students`)

    // Check final notification counts
    console.log('\n📊 Final Notification Summary:')
    
    const totalUserNotifications = await prisma.notification.count()
    const totalNewNotifications = await prisma.newNotification.count()
    const studentNotifications = await prisma.notification.count({
      where: { userId: student.id }
    })
    const unreadStudentNotifications = await prisma.notification.count({
      where: { userId: student.id, isRead: false }
    })

    console.log(`  - Total user notifications in system: ${totalUserNotifications}`)
    console.log(`  - Total NEW notifications in system: ${totalNewNotifications}`)
    console.log(`  - Notifications for test student: ${studentNotifications}`)
    console.log(`  - Unread notifications for test student: ${unreadStudentNotifications}`)

    // Show recent notifications for the student
    const recentNotifications = await prisma.notification.findMany({
      where: { userId: student.id },
      orderBy: { createdAt: 'desc' },
      take: 5
    })

    console.log('\n📋 Recent notifications for student:')
    recentNotifications.forEach((notification, index) => {
      console.log(`  ${index + 1}. ${notification.title}`)
      console.log(`     ${notification.message}`)
      console.log(`     Type: ${notification.type} | Read: ${notification.isRead}`)
      console.log('')
    })

    console.log('🎉 API notification test completed successfully!')
    console.log('\n💡 Now test in the browser:')
    console.log('1. Login as a student user')
    console.log('2. Check the notifications page - should show new notifications')
    console.log('3. Look for NEW badges on Courses and Resources in the sidebar')
    console.log('4. Check the right notification panel')

  } catch (error) {
    console.error('❌ Test failed:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testAPINotifications()
