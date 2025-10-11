#!/usr/bin/env node

/**
 * Script to restore default admin and demo users
 * This ensures the system has the necessary users for login
 */

const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function restoreDefaultUsers() {
  console.log('🔄 Restoring default users...')
  
  try {
    // Clear existing users to start fresh
    console.log('🧹 Clearing existing users...')
    await prisma.user.deleteMany({})
    
    // Create default admin users
    const users = [
      {
        email: 'admin@xenforex.com',
        name: 'Super Admin',
        password: await bcrypt.hash('admin123', 10),
        role: 'SUPERADMIN',
        image: null
      },
      {
        email: 'analyst@xenforex.com',
        name: 'Analyst',
        password: await bcrypt.hash('analyst123', 10),
        role: 'ANALYST',
        image: null
      },
      {
        email: 'editor@xenforex.com',
        name: 'Editor',
        password: await bcrypt.hash('editor123', 10),
        role: 'EDITOR',
        image: null
      },
      {
        email: 'admin@corefx.com',
        name: 'CoreFX Admin',
        password: null, // Demo user - no password required
        role: 'ADMIN',
        image: null
      },
      {
        email: 'brian@corefx.com',
        name: 'BRIAN AMOOTI',
        password: null, // Demo user - no password required
        role: 'STUDENT',
        image: null
      }
    ]
    
    console.log('👥 Creating default users...')
    for (const userData of users) {
      const user = await prisma.user.create({
        data: userData
      })
      console.log(`✅ Created user: ${user.email} (${user.role})`)
    }
    
    // Create some basic settings
    console.log('⚙️ Creating default settings...')
    const settings = [
      {
        key: 'siteName',
        value: 'XEN Forex',
        category: 'general'
      },
      {
        key: 'siteUrl',
        value: 'http://localhost:3001',
        category: 'general'
      },
      {
        key: 'logoUrl',
        value: null,
        category: 'general'
      }
    ]
    
    for (const setting of settings) {
      await prisma.settings.upsert({
        where: { key: setting.key },
        update: { value: setting.value },
        create: setting
      })
    }
    
    console.log('✅ Default settings created')
    
    // Verify users were created
    const userCount = await prisma.user.count()
    console.log(`📊 Total users created: ${userCount}`)
    
    // List all users
    const allUsers = await prisma.user.findMany({
      select: {
        email: true,
        name: true,
        role: true
      }
    })
    
    console.log('\n📋 Created users:')
    allUsers.forEach(user => {
      console.log(`   ${user.email} - ${user.name} (${user.role})`)
    })
    
    console.log('\n🎉 Default users restored successfully!')
    console.log('\n🔑 Login credentials:')
    console.log('   Super Admin: admin@xenforex.com / admin123')
    console.log('   Analyst: analyst@xenforex.com / analyst123')
    console.log('   Editor: editor@xenforex.com / editor123')
    console.log('   CoreFX Admin: admin@corefx.com / (any password)')
    console.log('   Student: brian@corefx.com / (any password)')
    
  } catch (error) {
    console.error('❌ Error restoring users:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

restoreDefaultUsers()

