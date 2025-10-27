import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const platforms = await prisma.copyTradingPlatform.findMany({
    orderBy: { displayOrder: 'asc' }
  })

  console.log(`Found ${platforms.length} platforms:`)
  platforms.forEach(p => {
    console.log(`- ${p.name} (${p.slug}) - Active: ${p.isActive}`)
  })
}

main()
  .catch((e) => {
    console.error('Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
