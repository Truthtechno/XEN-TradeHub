import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function seedEvents() {
  try {
    console.log('Seeding events...')

    // Clear existing events
    await prisma.event.deleteMany({})

    // Create sample events
    const events = [
      {
        title: 'Forex Trading Workshop',
        description: 'Learn advanced trading strategies and risk management techniques from our expert traders.',
        type: 'WORKSHOP',
        startDate: new Date('2025-10-15T10:00:00Z'),
        endDate: new Date('2025-10-15T16:00:00Z'),
        location: 'CoreFX Academy, Kampala',
        price: 50,
        currency: 'USD',
        maxAttendees: 30,
        isPublished: true
      },
      {
        title: 'Live Trading Session',
        description: 'Watch CoreFX team trade live and learn real-time decision making in the forex market.',
        type: 'WEBINAR',
        startDate: new Date('2025-10-20T14:00:00Z'),
        endDate: new Date('2025-10-20T15:00:00Z'),
        location: 'Online',
        price: 0,
        currency: 'USD',
        maxAttendees: 100,
        isPublished: true
      },
      {
        title: 'Advanced Strategy Seminar',
        description: 'Deep dive into confluence trading and market structure analysis for experienced traders.',
        type: 'SEMINAR',
        startDate: new Date('2025-11-05T09:00:00Z'),
        endDate: new Date('2025-11-05T17:00:00Z'),
        location: 'CoreFX Academy, Kampala',
        price: 100,
        currency: 'USD',
        maxAttendees: 20,
        isPublished: true
      },
      {
        title: 'Forex Conference 2025',
        description: 'Join industry leaders and expert traders for a comprehensive forex trading conference.',
        type: 'CONFERENCE',
        startDate: new Date('2025-12-01T08:00:00Z'),
        endDate: new Date('2025-12-03T18:00:00Z'),
        location: 'Kampala Convention Centre',
        price: 200,
        currency: 'USD',
        maxAttendees: 500,
        isPublished: true
      },
      {
        title: 'Beginner Trading Course',
        description: 'Perfect for newcomers to forex trading. Learn the basics and fundamentals.',
        type: 'WORKSHOP',
        startDate: new Date('2025-10-25T09:00:00Z'),
        endDate: new Date('2025-10-25T12:00:00Z'),
        location: 'Online',
        price: 0,
        currency: 'USD',
        maxAttendees: 50,
        isPublished: true
      },
      {
        title: 'Risk Management Masterclass',
        description: 'Advanced techniques for managing risk in forex trading.',
        type: 'SEMINAR',
        startDate: new Date('2025-11-15T10:00:00Z'),
        endDate: new Date('2025-11-15T15:00:00Z'),
        location: 'CoreFX Academy, Kampala',
        price: 75,
        currency: 'USD',
        maxAttendees: 25,
        isPublished: false // Draft event
      }
    ]

    for (const eventData of events) {
      await prisma.event.create({
        data: eventData
      })
    }

    console.log('Events seeded successfully!')
    console.log(`Created ${events.length} events`)

  } catch (error) {
    console.error('Error seeding events:', error)
  } finally {
    await prisma.$disconnect()
  }
}

seedEvents()
