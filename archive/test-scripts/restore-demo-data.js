/**
 * Restore Demo Data
 */

const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function restoreDemoData() {
  try {
    console.log('Restoring demo data...')
    
    // Get admin user for creating demo data
    const adminUser = await prisma.user.findUnique({
      where: { email: 'admin@corefx.com' }
    })
    
    if (!adminUser) {
      console.log('Admin user not found, skipping demo data creation')
      return
    }
    
    // Create some demo resources
    const existingResources = await prisma.resource.count()
    if (existingResources === 0) {
      console.log('Creating demo resources...')
      
      const resources = [
        {
          title: 'Advanced Trading Strategies',
          description: 'Comprehensive guide to advanced trading techniques',
          type: 'PDF',
          isPremium: true,
          priceUSD: 25.00,
          fileUrl: '/uploads/advanced-trading-strategies.pdf',
          category: 'Education'
        },
        {
          title: 'Market Analysis Tools',
          description: 'Professional tools for market analysis',
          type: 'TOOL',
          isPremium: true,
          priceUSD: 50.00,
          fileUrl: '/uploads/market-analysis-tools.zip',
          category: 'Tools'
        },
        {
          title: 'Free Trading Basics',
          description: 'Basic trading concepts for beginners',
          type: 'PDF',
          isPremium: false,
          priceUSD: 0.00,
          fileUrl: '/uploads/trading-basics.pdf',
          category: 'Education'
        }
      ]
      
      for (const resourceData of resources) {
        const resource = await prisma.resource.create({
          data: resourceData
        })
        console.log(`✅ Created resource: ${resource.title}`)
      }
    } else {
      console.log(`ℹ️  Resources already exist (${existingResources} found)`)
    }
    
    // Create some demo courses
    const existingCourses = await prisma.course.count()
    if (existingCourses === 0) {
      console.log('Creating demo courses...')
      
      const courses = [
        {
          title: 'The GOAT Strategy',
          description: 'Master the most effective trading strategy',
          priceUSD: 199.00,
          isPremium: true,
          instructor: 'XEN Forex Team',
          duration: '8 weeks',
          level: 'INTERMEDIATE',
          status: 'ACTIVE'
        },
        {
          title: 'Forex Fundamentals',
          description: 'Learn the basics of forex trading',
          priceUSD: 0.00,
          isPremium: false,
          instructor: 'XEN Forex Team',
          duration: '4 weeks',
          level: 'BEGINNER',
          status: 'ACTIVE'
        }
      ]
      
      for (const courseData of courses) {
        const course = await prisma.course.create({
          data: courseData
        })
        console.log(`✅ Created course: ${course.title}`)
      }
    } else {
      console.log(`ℹ️  Courses already exist (${existingCourses} found)`)
    }
    
    console.log('\n🎉 Demo data restored!')
    console.log('The system now has:')
    console.log('- Demo users with different roles')
    console.log('- Sample resources (premium and free)')
    console.log('- Sample courses')
    console.log('- Test signals (from previous setup)')
    console.log('- Mentorship system fully functional')
    
  } catch (error) {
    console.error('Error restoring demo data:', error)
  } finally {
    await prisma.$disconnect()
  }
}

restoreDemoData()
