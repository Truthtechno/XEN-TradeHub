/**
 * Add likes and purchases to existing resources
 * This script simulates user engagement with the resources shown in the admin dashboard
 */

const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function addResourceEngagement() {
  try {
    console.log('🎯 Adding likes and purchases to existing resources...')
    
    // First, let's see what resources we have
    const existingResources = await prisma.resource.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10
    })
    
    console.log(`Found ${existingResources.length} existing resources:`)
    existingResources.forEach((resource, index) => {
      console.log(`${index + 1}. ${resource.title} (${resource.type}) - ${resource.likes} likes`)
    })
    
    // Get some users to simulate likes and purchases
    const users = await prisma.user.findMany({
      where: {
        role: {
          not: 'ADMIN'
        }
      },
      take: 10
    })
    
    if (users.length === 0) {
      console.log('❌ No regular users found. Creating some test users first...')
      
      // Create some test users
      const testUsers = []
      for (let i = 1; i <= 5; i++) {
        const user = await prisma.user.create({
          data: {
            email: `user${i}@example.com`,
            name: `Test User ${i}`,
            role: 'USER',
            isEmailVerified: true
          }
        })
        testUsers.push(user)
      }
      users.push(...testUsers)
    }
    
    console.log(`Using ${users.length} users for engagement simulation`)
    
    // Add likes to resources
    console.log('\n❤️  Adding likes to resources...')
    
    for (const resource of existingResources) {
      // Determine how many likes to add (random between 5-50)
      const likesToAdd = Math.floor(Math.random() * 46) + 5
      
      // Get random users to like this resource
      const shuffledUsers = users.sort(() => 0.5 - Math.random())
      const usersToLike = shuffledUsers.slice(0, Math.min(likesToAdd, users.length))
      
      for (const user of usersToLike) {
        try {
          await prisma.userResourceLike.upsert({
            where: {
              userId_resourceId: {
                userId: user.id,
                resourceId: resource.id
              }
            },
            update: {},
            create: {
              userId: user.id,
              resourceId: resource.id
            }
          })
        } catch (error) {
          // Ignore duplicate like errors
          if (!error.message.includes('Unique constraint')) {
            console.log(`Error adding like: ${error.message}`)
          }
        }
      }
      
      // Update the resource's like count
      const actualLikes = await prisma.userResourceLike.count({
        where: { resourceId: resource.id }
      })
      
      await prisma.resource.update({
        where: { id: resource.id },
        data: { likes: actualLikes }
      })
      
      console.log(`✅ Added ${actualLikes} likes to "${resource.title}"`)
    }
    
    // Add purchases for premium resources
    console.log('\n💰 Adding purchases for premium resources...')
    
    const premiumResources = existingResources.filter(resource => resource.isPremium && resource.priceUSD > 0)
    
    for (const resource of premiumResources) {
      // Determine how many purchases to add (random between 2-15)
      const purchasesToAdd = Math.floor(Math.random() * 14) + 2
      
      // Get random users to purchase this resource
      const shuffledUsers = users.sort(() => 0.5 - Math.random())
      const usersToPurchase = shuffledUsers.slice(0, Math.min(purchasesToAdd, users.length))
      
      for (const user of usersToPurchase) {
        try {
          await prisma.resourcePurchase.create({
            data: {
              userId: user.id,
              resourceId: resource.id,
              amountUSD: resource.priceUSD,
              status: 'COMPLETED',
              stripeId: `pi_test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
            }
          })
        } catch (error) {
          console.log(`Error adding purchase: ${error.message}`)
        }
      }
      
      console.log(`✅ Added ${purchasesToAdd} purchases for "${resource.title}" ($${resource.priceUSD})`)
    }
    
    // Show final statistics
    console.log('\n📊 Final Statistics:')
    
    const updatedResources = await prisma.resource.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10
    })
    
    for (const resource of updatedResources) {
      const purchaseCount = await prisma.resourcePurchase.count({
        where: { resourceId: resource.id }
      })
      
      console.log(`📚 ${resource.title}:`)
      console.log(`   ❤️  Likes: ${resource.likes}`)
      console.log(`   💰 Purchases: ${purchaseCount}`)
      console.log(`   💵 Revenue: $${(purchaseCount * (resource.priceUSD || 0)).toFixed(2)}`)
      console.log('')
    }
    
    // Calculate total revenue
    const totalRevenue = await prisma.resourcePurchase.aggregate({
      _sum: {
        amountUSD: true
      },
      where: {
        status: 'COMPLETED'
      }
    })
    
    console.log(`🎉 Total Revenue: $${(totalRevenue._sum.amountUSD || 0).toFixed(2)}`)
    
  } catch (error) {
    console.error('❌ Error adding resource engagement:', error)
  } finally {
    await prisma.$disconnect()
  }
}

addResourceEngagement()
