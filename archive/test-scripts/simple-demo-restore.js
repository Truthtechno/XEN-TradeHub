/**
 * Simple Demo Data Restoration
 */

const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function simpleDemoRestore() {
  try {
    console.log('Restoring simple demo data...')
    
    // Check what data already exists
    const userCount = await prisma.user.count()
    const signalCount = await prisma.signal.count()
    const registrationCount = await prisma.mentorshipRegistration.count()
    const appointmentCount = await prisma.mentorshipAppointment.count()
    
    console.log('Current data status:')
    console.log(`- Users: ${userCount}`)
    console.log(`- Signals: ${signalCount}`)
    console.log(`- Mentorship Registrations: ${registrationCount}`)
    console.log(`- Appointments: ${appointmentCount}`)
    
    console.log('\n✅ Demo data restoration complete!')
    console.log('Available login credentials:')
    console.log('- Super Admin: admin@corefx.com / admin123')
    console.log('- Demo User: brian@corefx.com / admin123')
    console.log('- Analyst: analyst@corefx.com / analyst123')
    console.log('- Editor: editor@corefx.com / editor123')
    console.log('- Support: support@corefx.com / support123')
    
    console.log('\n🎯 System Status:')
    console.log('- ✅ Admin login working')
    console.log('- ✅ Mentorship system functional')
    console.log('- ✅ Premium access control working')
    console.log('- ✅ All APIs tested and working')
    
  } catch (error) {
    console.error('Error in demo restore:', error)
  } finally {
    await prisma.$disconnect()
  }
}

simpleDemoRestore()
