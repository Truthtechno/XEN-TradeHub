/**
 * Restore Demo Users
 */

const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function restoreDemoUsers() {
  try {
    console.log('Restoring demo users...')
    
    const demoUsers = [
      {
        email: 'analyst@corefx.com',
        name: 'Analyst User',
        password: 'analyst123',
        role: 'ANALYST'
      },
      {
        email: 'editor@corefx.com',
        name: 'Editor User',
        password: 'editor123',
        role: 'EDITOR'
      },
      {
        email: 'support@corefx.com',
        name: 'Support User',
        password: 'support123',
        role: 'SUPPORT'
      }
    ]
    
    for (const userData of demoUsers) {
      const existingUser = await prisma.user.findUnique({
        where: { email: userData.email }
      })
      
      if (!existingUser) {
        const hashedPassword = await bcrypt.hash(userData.password, 12)
        
        const user = await prisma.user.create({
          data: {
            email: userData.email,
            name: userData.name,
            password: hashedPassword,
            role: userData.role
          }
        })
        
        console.log(`✅ Created ${userData.role}: ${user.email} / ${userData.password}`)
      } else {
        console.log(`ℹ️  ${userData.role} already exists: ${userData.email}`)
      }
    }
    
    console.log('\n🎉 Demo users restored!')
    console.log('Available credentials:')
    console.log('- Super Admin: admin@corefx.com / admin123')
    console.log('- Demo User: brian@corefx.com / admin123')
    console.log('- Analyst: analyst@corefx.com / analyst123')
    console.log('- Editor: editor@corefx.com / editor123')
    console.log('- Support: support@corefx.com / support123')
    
  } catch (error) {
    console.error('Error restoring demo users:', error)
  } finally {
    await prisma.$disconnect()
  }
}

restoreDemoUsers()
