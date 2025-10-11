#!/usr/bin/env node

/**
 * Fix admin user roles
 */

const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function fixAdminRoles() {
  console.log('🔧 Fixing admin user roles...')
  
  try {
    // Fix admin@xenforex.com to SUPERADMIN
    const admin = await prisma.user.update({
      where: { email: 'admin@xenforex.com' },
      data: { role: 'SUPERADMIN' }
    })
    console.log('✅ Updated admin@xenforex.com to SUPERADMIN')

    // Fix analyst@xenforex.com to ANALYST
    const analyst = await prisma.user.update({
      where: { email: 'analyst@xenforex.com' },
      data: { role: 'ANALYST' }
    })
    console.log('✅ Updated analyst@xenforex.com to ANALYST')

    // Fix editor@xenforex.com to EDITOR
    const editor = await prisma.user.update({
      where: { email: 'editor@xenforex.com' },
      data: { role: 'EDITOR' }
    })
    console.log('✅ Updated editor@xenforex.com to EDITOR')

    // Create admin@corefx.com if it doesn't exist
    const corefxAdmin = await prisma.user.upsert({
      where: { email: 'admin@corefx.com' },
      update: { role: 'SUPERADMIN' },
      create: {
        email: 'admin@corefx.com',
        name: 'CoreFX Admin',
        role: 'SUPERADMIN',
        password: await bcrypt.hash('admin123', 10)
      }
    })
    console.log('✅ Created/Updated admin@corefx.com as SUPERADMIN')

    // Verify all admin users
    console.log('\n🔍 Verifying admin users...')
    const adminUsers = await prisma.user.findMany({
      where: {
        role: {
          in: ['SUPERADMIN', 'ADMIN', 'ANALYST', 'EDITOR']
        }
      },
      select: {
        email: true,
        name: true,
        role: true
      }
    })

    console.log('📊 Admin users:')
    adminUsers.forEach(user => {
      console.log(`  ${user.email} - ${user.name} (${user.role})`)
    })

    console.log('\n🎉 Admin roles fixed successfully!')
    console.log('\n🔑 You can now login with:')
    console.log('  admin@xenforex.com / admin123 (Super Admin)')
    console.log('  admin@corefx.com / admin123 (Super Admin)')
    console.log('  analyst@xenforex.com / analyst123 (Analyst)')
    console.log('  editor@xenforex.com / editor123 (Editor)')

  } catch (error) {
    console.error('❌ Error fixing admin roles:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Run if this script is executed directly
if (require.main === module) {
  fixAdminRoles().catch(console.error)
}

module.exports = { fixAdminRoles }
