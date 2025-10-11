#!/usr/bin/env node

/**
 * Clean restore script - bypasses all migration issues
 * Creates a simple, working authentication system
 */

const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function cleanRestore() {
  console.log('🧹 Starting clean restore...')
  
  try {
    // First, let's check if we can connect to the database
    console.log('🔌 Testing database connection...')
    await prisma.$connect()
    console.log('✅ Database connected')
    
    // Drop and recreate the database schema (clean slate)
    console.log('🗑️ Resetting database schema...')
    await prisma.$executeRaw`DROP SCHEMA IF EXISTS public CASCADE`
    await prisma.$executeRaw`CREATE SCHEMA public`
    console.log('✅ Database schema reset')
    
    // Push the current schema
    console.log('📋 Applying current schema...')
    const { execSync } = require('child_process')
    execSync('npx prisma db push --force-reset', { stdio: 'inherit' })
    console.log('✅ Schema applied')
    
    // Create essential users with simple authentication
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
    
    console.log('\n🎉 Clean restore completed successfully!')
    console.log('\n🔑 Login credentials:')
    console.log('   Super Admin: admin@xenforex.com / admin123')
    console.log('   Analyst: analyst@xenforex.com / analyst123') 
    console.log('   Editor: editor@xenforex.com / editor123')
    console.log('   CoreFX Admin: admin@corefx.com / (any password)')
    console.log('   Student: brian@corefx.com / (any password)')
    console.log('\n🌐 Access your app at: http://localhost:3001')
    
  } catch (error) {
    console.error('❌ Clean restore failed:', error.message)
    
    // If database connection fails, provide alternative solution
    if (error.message.includes('Can\'t reach database server')) {
      console.log('\n🔧 Database connection failed. Please ensure PostgreSQL is running:')
      console.log('   1. Start Docker: docker-compose up -d')
      console.log('   2. Wait 10 seconds for database to initialize')
      console.log('   3. Run this script again: node scripts/clean-restore.js')
    }
    
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

cleanRestore()

