const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function fixAdminRole() {
  try {
    console.log('🔧 Fixing admin@corefx.com role...')
    
    // Check current user
    const currentUser = await prisma.user.findUnique({
      where: { email: 'admin@corefx.com' }
    })
    
    if (!currentUser) {
      console.log('❌ User admin@corefx.com not found')
      return
    }
    
    console.log('Current user:', {
      email: currentUser.email,
      name: currentUser.name,
      role: currentUser.role
    })
    
    // Update to SUPERADMIN
    const hashedPassword = await bcrypt.hash('admin123', 10)
    const updatedUser = await prisma.user.update({
      where: { email: 'admin@corefx.com' },
      data: {
        role: 'SUPERADMIN',
        password: hashedPassword,
        name: 'Admin User'
      }
    })
    
    console.log('\n✅ Updated user:', {
      email: updatedUser.email,
      name: updatedUser.name,
      role: updatedUser.role
    })
    
    console.log('\n🎉 Admin role fixed!')
    console.log('You can now login with: admin@corefx.com / admin123')
    
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

fixAdminRole()
