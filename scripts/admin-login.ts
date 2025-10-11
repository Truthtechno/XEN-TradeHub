import { PrismaClient } from '@prisma/client'
import jwt from 'jsonwebtoken'

const prisma = new PrismaClient()

async function createAdminToken() {
  try {
    // Get the first admin user
    const adminUser = await prisma.user.findFirst({
      where: {
        role: 'SUPERADMIN'
      }
    })

    if (!adminUser) {
      console.log('No admin user found')
      return
    }

    // Create JWT token
    const token = jwt.sign(
      { 
        id: adminUser.id,
        email: adminUser.email,
        role: adminUser.role 
      },
      process.env.JWT_SECRET!,
      { expiresIn: '24h' }
    )

    console.log('Admin login token created:')
    console.log('User:', adminUser.email, `(${adminUser.role})`)
    console.log('Token:', token)
    console.log('\nTo use this token:')
    console.log('1. Open browser developer tools (F12)')
    console.log('2. Go to Application/Storage tab')
    console.log('3. Find Cookies for localhost:3000')
    console.log('4. Add a new cookie:')
    console.log('   Name: auth-token')
    console.log('   Value:', token)
    console.log('   Domain: localhost')
    console.log('   Path: /')
    console.log('5. Refresh the page')

  } catch (error) {
    console.error('Error creating admin token:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createAdminToken()
