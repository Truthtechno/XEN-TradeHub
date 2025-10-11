import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function seedAdminUsers() {
  try {
    console.log('Seeding admin users...')

    // Create Super Admin
    const superAdminPassword = await bcrypt.hash('admin123', 10)
    const superAdmin = await prisma.user.upsert({
      where: { email: 'admin@corefx.com' },
      update: {},
      create: {
        email: 'admin@corefx.com',
        name: 'Super Admin',
        password: superAdminPassword,
        role: 'SUPERADMIN',
      },
    })

    // Create Admin
    const adminPassword = await bcrypt.hash('admin123', 10)
    const admin = await prisma.user.upsert({
      where: { email: 'admin@xenforex.com' },
      update: {},
      create: {
        email: 'admin@xenforex.com',
        name: 'Admin User',
        password: adminPassword,
        role: 'ADMIN',
      },
    })

    // Create Analyst
    const analystPassword = await bcrypt.hash('analyst123', 10)
    const analyst = await prisma.user.upsert({
      where: { email: 'analyst@xenforex.com' },
      update: {},
      create: {
        email: 'analyst@xenforex.com',
        name: 'Analyst User',
        password: analystPassword,
        role: 'ANALYST',
      },
    })

    // Create Editor
    const editorPassword = await bcrypt.hash('editor123', 10)
    const editor = await prisma.user.upsert({
      where: { email: 'editor@xenforex.com' },
      update: {},
      create: {
        email: 'editor@xenforex.com',
        name: 'Editor User',
        password: editorPassword,
        role: 'EDITOR',
      },
    })

    console.log('Admin users created successfully!')
    console.log('Super Admin:', superAdmin.email)
    console.log('Admin:', admin.email)
    console.log('Analyst:', analyst.email)
    console.log('Editor:', editor.email)
    console.log('\nYou can now login with:')
    console.log('admin@corefx.com / admin123 (Super Admin)')
    console.log('admin@xenforex.com / admin123 (Admin)')
    console.log('analyst@xenforex.com / analyst123 (Analyst)')
    console.log('editor@xenforex.com / editor123 (Editor)')

  } catch (error) {
    console.error('Error seeding admin users:', error)
  } finally {
    await prisma.$disconnect()
  }
}

seedAdminUsers()
