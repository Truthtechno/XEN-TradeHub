const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding academy classes...')

  // Create sample academy classes
  const academyClasses = [
    {
      title: 'Beginner Forex Course',
      description: 'Complete introduction to forex trading for beginners',
      price: 50,
      currency: 'USD',
      duration: '2 days',
      level: 'BEGINNER',
      maxStudents: 20,
      instructor: 'XEN Forex Team',
      location: 'XEN Forex Academy, Kampala',
      nextSession: new Date('2025-10-15T09:00:00Z'),
      status: 'UPCOMING',
      isPublished: true
    },
    {
      title: 'Advanced Strategy Workshop',
      description: 'Master advanced trading strategies and risk management',
      price: 250,
      currency: 'USD',
      duration: '3 days',
      level: 'ADVANCED',
      maxStudents: 15,
      instructor: 'XEN Forex Team',
      location: 'XEN Forex Academy, Kampala',
      nextSession: new Date('2025-10-22T09:00:00Z'),
      status: 'UPCOMING',
      isPublished: true
    },
    {
      title: 'Intermediate Technical Analysis',
      description: 'Learn technical analysis tools and chart patterns',
      price: 150,
      currency: 'USD',
      duration: '2 days',
      level: 'INTERMEDIATE',
      maxStudents: 18,
      instructor: 'XEN Forex Team',
      location: 'XEN Forex Academy, Kampala',
      nextSession: new Date('2025-11-05T09:00:00Z'),
      status: 'UPCOMING',
      isPublished: true
    },
    {
      title: 'Risk Management Masterclass',
      description: 'Professional risk management techniques and position sizing',
      price: 200,
      currency: 'USD',
      duration: '1 day',
      level: 'MASTERCLASS',
      maxStudents: 12,
      instructor: 'XEN Forex Team',
      location: 'XEN Forex Academy, Kampala',
      nextSession: new Date('2025-11-15T09:00:00Z'),
      status: 'UPCOMING',
      isPublished: true
    }
  ]

  for (const classData of academyClasses) {
    // Check if class already exists
    const existingClass = await prisma.academyClass.findFirst({
      where: { title: classData.title }
    })
    
    if (!existingClass) {
      await prisma.academyClass.create({
        data: classData
      })
    }
  }

  console.log('Academy classes seeded successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
