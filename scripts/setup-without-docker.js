#!/usr/bin/env node

/**
 * Setup script that works without Docker
 * Uses SQLite instead of PostgreSQL
 */

const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')
const { execSync } = require('child_process')

const prisma = new PrismaClient()

async function setupWithoutDocker() {
  console.log('🚀 Setting up CoreFX without Docker...')
  
  try {
    // Generate Prisma client for SQLite
    console.log('📦 Generating Prisma client...')
    execSync('npx prisma generate', { stdio: 'inherit' })
    
    // Push schema to SQLite database
    console.log('🗄️ Creating SQLite database...')
    execSync('npx prisma db push --force-reset', { stdio: 'inherit' })
    
    // Test database connection
    console.log('🔌 Testing database connection...')
    await prisma.$connect()
    console.log('✅ SQLite database connected')
    
    // Create essential users
    console.log('👥 Creating essential users...')
    
    const users = [
      {
        email: 'admin@xenforex.com',
        name: 'Super Admin',
        password: await bcrypt.hash('admin123', 10),
        role: 'SUPERADMIN'
      },
      {
        email: 'analyst@xenforex.com', 
        name: 'Analyst',
        password: await bcrypt.hash('analyst123', 10),
        role: 'ANALYST'
      },
      {
        email: 'editor@xenforex.com',
        name: 'Editor', 
        password: await bcrypt.hash('editor123', 10),
        role: 'EDITOR'
      },
      {
        email: 'admin@corefx.com',
        name: 'CoreFX Admin',
        password: null, // Demo user - accepts any password
        role: 'ADMIN'
      },
      {
        email: 'brian@corefx.com',
        name: 'BRIAN AMOOTI',
        password: null, // Demo user - accepts any password  
        role: 'STUDENT'
      }
    ]
    
    for (const userData of users) {
      await prisma.user.create({
        data: userData
      })
      console.log(`✅ Created: ${userData.email} (${userData.role})`)
    }
    
    // Create basic settings
    console.log('⚙️ Creating basic settings...')
    const settings = [
      { key: 'siteName', value: 'XEN Forex', category: 'general' },
      { key: 'siteUrl', value: 'http://localhost:3001', category: 'general' }
    ]
    
    for (const setting of settings) {
      await prisma.settings.upsert({
        where: { key: setting.key },
        update: { value: setting.value },
        create: setting
      })
    }
    
    console.log('✅ Basic settings created')
    
    // Verify everything works
    const userCount = await prisma.user.count()
    console.log(`📊 Total users: ${userCount}`)
    
    console.log('\n🎉 Setup completed successfully!')
    console.log('\n🔑 Login credentials:')
    console.log('   Super Admin: admin@xenforex.com / admin123')
    console.log('   Analyst: analyst@xenforex.com / analyst123') 
    console.log('   Editor: editor@xenforex.com / editor123')
    console.log('   CoreFX Admin: admin@corefx.com / (any password)')
    console.log('   Student: brian@corefx.com / (any password)')
    console.log('\n🌐 Start your app: npm run dev')
    console.log('🌐 Access at: http://localhost:3001')
    console.log('\n📁 Database file: ./dev.db (SQLite)')
    
  } catch (error) {
    console.error('❌ Setup failed:', error.message)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

setupWithoutDocker()
