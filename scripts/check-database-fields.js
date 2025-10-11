#!/usr/bin/env node

/**
 * Check what fields exist in the database
 */

const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function checkDatabaseFields() {
  console.log('🔍 Checking database fields...')
  
  try {
    // Try to create a subscription with minimal data
    const testSubscription = await prisma.signalSubscription.create({
      data: {
        userId: 'test-user-123',
        // Only include fields that definitely exist
      }
    })
    
    console.log('✅ Successfully created subscription with minimal data:', testSubscription.id)
    console.log('Available fields:', Object.keys(testSubscription))
    
    // Clean up
    await prisma.signalSubscription.delete({
      where: { id: testSubscription.id }
    })
    
    console.log('✅ Cleaned up test data')
    
  } catch (error) {
    console.error('❌ Error checking database fields:', error.message)
    
    // Try to get the schema information
    try {
      const subscriptions = await prisma.signalSubscription.findMany({
        take: 1
      })
      
      if (subscriptions.length > 0) {
        console.log('Available fields from existing record:', Object.keys(subscriptions[0]))
      } else {
        console.log('No existing subscriptions found')
      }
    } catch (schemaError) {
      console.error('❌ Error getting schema info:', schemaError.message)
    }
  } finally {
    await prisma.$disconnect()
  }
}

// Run check if this script is executed directly
if (require.main === module) {
  checkDatabaseFields().catch(console.error)
}

module.exports = { checkDatabaseFields }
