/**
 * Fix Admin Login - Update admin user with correct password
 */

const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function fixAdminLogin() {
  try {
    console.log('Fixing admin login...')
    
    // Check if admin user exists
    const adminUser = await prisma.user.findUnique({
      where: { email: 'admin@corefx.com' }
    })
    
    if (!adminUser) {
      console.log('Admin user not found, creating...')
      const hashedPassword = await bcrypt.hash('admin123', 12)
      
      const newAdminUser = await prisma.user.create({
        data: {
          email: 'admin@corefx.com',
          name: 'Admin User',
          password: hashedPassword,
          role: 'SUPERADMIN'
        }
      })
      
      console.log('Admin user created:', newAdminUser.email)
    } else {
      console.log('Admin user found, updating password...')
      
      // Update password to match demo credentials
      const hashedPassword = await bcrypt.hash('admin123', 12)
      
      const updatedAdmin = await prisma.user.update({
        where: { email: 'admin@corefx.com' },
        data: { password: hashedPassword }
      })
      
      console.log('Admin password updated:', updatedAdmin.email)
    }
    
    // Also create a demo user for testing
    const demoUser = await prisma.user.findUnique({
      where: { email: 'brian@corefx.com' }
    })
    
    if (!demoUser) {
      console.log('Creating demo user...')
      const hashedPassword = await bcrypt.hash('admin123', 12)
      
      const newDemoUser = await prisma.user.create({
        data: {
          email: 'brian@corefx.com',
          name: 'Brian Demo',
          password: hashedPassword,
          role: 'STUDENT'
        }
      })
      
      console.log('Demo user created:', newDemoUser.email)
    } else {
      console.log('Demo user already exists:', demoUser.email)
    }
    
    console.log('✅ Admin login fixed!')
    console.log('Credentials:')
    console.log('- Admin: admin@corefx.com / admin123')
    console.log('- Demo User: brian@corefx.com / admin123')
    
  } catch (error) {
    console.error('Error fixing admin login:', error)
  } finally {
    await prisma.$disconnect()
  }
}

fixAdminLogin()
