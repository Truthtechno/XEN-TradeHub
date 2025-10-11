#!/usr/bin/env node

/**
 * Check users in database and test login
 */

const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function checkUsers() {
  console.log('🔍 Checking users in database...')
  
  try {
    // Get all users
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        password: true,
        createdAt: true
      },
      orderBy: { createdAt: 'asc' }
    })
    
    console.log(`\n📊 Found ${users.length} users:`)
    console.log('================================')
    
    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name} (${user.email})`)
      console.log(`   Role: ${user.role}`)
      console.log(`   Has Password: ${user.password ? 'Yes' : 'No'}`)
      console.log(`   Created: ${user.createdAt.toISOString()}`)
      console.log('')
    })
    
    // Test admin login
    console.log('🧪 Testing admin login...')
    const adminUser = await prisma.user.findUnique({
      where: { email: 'admin@xenforex.com' }
    })
    
    if (adminUser) {
      console.log('✅ Admin user found:', adminUser.email)
      console.log('   Role:', adminUser.role)
      console.log('   Has Password:', adminUser.password ? 'Yes' : 'No')
      
      if (adminUser.password) {
        const isValidPassword = await bcrypt.compare('admin123', adminUser.password)
        console.log('   Password "admin123" is valid:', isValidPassword)
      }
    } else {
      console.log('❌ Admin user not found!')
    }
    
    // Test other demo users
    const demoUsers = [
      'analyst@xenforex.com',
      'editor@xenforex.com',
      'admin@corefx.com'
    ]
    
    console.log('\n🧪 Testing demo users...')
    for (const email of demoUsers) {
      const user = await prisma.user.findUnique({
        where: { email }
      })
      
      if (user) {
        console.log(`✅ ${email} - Found (Role: ${user.role})`)
        if (user.password) {
          const password = email.includes('analyst') ? 'analyst123' : 
                          email.includes('editor') ? 'editor123' : 'admin123'
          const isValid = await bcrypt.compare(password, user.password)
          console.log(`   Password "${password}" is valid: ${isValid}`)
        }
      } else {
        console.log(`❌ ${email} - Not found`)
      }
    }
    
  } catch (error) {
    console.error('❌ Error checking users:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Run if this script is executed directly
if (require.main === module) {
  checkUsers().catch(console.error)
}

module.exports = { checkUsers }
