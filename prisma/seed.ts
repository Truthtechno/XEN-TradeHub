import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting seed for XEN TradeHub...')

  // ============================================
  // USERS
  // ============================================
  
  // Super Admin
  const adminPassword = await bcrypt.hash('admin123', 12)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@corefx.com' },
    update: {},
    create: {
      email: 'admin@corefx.com',
      name: 'Admin User',
      password: adminPassword,
      role: 'SUPERADMIN',
      lastLoginAt: new Date()
    }
  })

  // Brian User
  const brianPassword = await bcrypt.hash('admin123', 12)
  const brian = await prisma.user.upsert({
    where: { email: 'brian@corefx.com' },
    update: {},
    create: {
      email: 'brian@corefx.com',
      name: 'Brian Amooti',
      password: brianPassword,
      role: 'STUDENT',
      lastLoginAt: new Date()
    }
  })

  // Sample regular users
  const users: any[] = [brian]
  for (let i = 1; i <= 10; i++) {
    const userPassword = await bcrypt.hash('user123', 12)
    const user = await prisma.user.upsert({
      where: { email: `user${i}@example.com` },
      update: {},
      create: {
        email: `user${i}@example.com`,
        name: `Test User ${i}`,
        password: userPassword,
        role: 'STUDENT',
        lastLoginAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000)
      }
    })
    users.push(user)
  }

  console.log(`✅ Created ${users.length + 1} users`)

  // ============================================
  // BROKERS
  // ============================================
  
  const exness = await prisma.broker.upsert({
    where: { slug: 'exness' },
    update: {},
    create: {
      name: 'Exness',
      slug: 'exness',
      description: 'Trade with one of the world\'s leading forex brokers. Exness offers ultra-low spreads, instant execution, and excellent customer support.',
      logoUrl: '/uploads/exness-logo.png',
      referralLink: 'https://exness.com/register?ref=corefx',
      benefits: [
        'Ultra-low spreads from 0.0 pips',
        'Instant withdrawals 24/7',
        'No minimum deposit',
        'Leverage up to 1:Unlimited',
        'Premium trading signals'
      ],
      newAccountSteps: [
        { text: 'Create a Brokerage Account with this link', buttonText: 'Open Exness Registration', buttonLink: 'https://exness.com/register?ref=corefx' },
        { text: 'Create a trading account with leverage 1:2000 / 1:Unlimited' },
        { text: 'Verify & Fund your account with minimum $50' },
        { text: 'Download & install MT4/MT5 on your Mobile phone', note: '(Install it if you haven\'t yet)' }
      ],
      existingAccountSteps: [
        { text: 'Log in to your Exness account and click on Live Chat', buttonText: 'Live Chat', buttonLink: 'https://exness.com/support' },
        { text: 'Type and send "Change Partner" in the live chat' },
        { text: 'You\'ll receive a link to a form. Fill it out as follows:', bullets: ['Reason for Partner Change: Write "Trading Signals"', 'New Partner\'s Link: https://exness.com/register?ref=corefx', 'How You Found Your New Partner: Write "Telegram"'] },
        { text: 'Submit the form. Process could take up to 3 days', note: '3 days' },
        { text: 'Wait for confirmation email from Exness' }
      ],
      isActive: true,
      displayOrder: 0
    }
  })

  const hfm = await prisma.broker.upsert({
    where: { slug: 'hfm' },
    update: {},
    create: {
      name: 'HFM (HotForex)',
      slug: 'hfm',
      description: 'Award-winning broker with over 10 years of experience. HFM provides access to forex, commodities, indices, and cryptocurrencies.',
      logoUrl: '/uploads/hfm-logo.png',
      referralLink: 'https://www.hfm.com/sv/en/open-live-account?refid=corefx',
      benefits: [
        'Regulated by multiple authorities',
        'Competitive spreads',
        'Copy trading available',
        'Educational resources',
        'Dedicated support team'
      ],
      newAccountSteps: [
        { text: 'Create a Brokerage Account with this link', buttonText: 'Open HFM Registration', buttonLink: 'https://www.hfm.com/sv/en/open-live-account?refid=corefx' },
        { text: 'Complete KYC verification' },
        { text: 'Fund your account with minimum $50' },
        { text: 'Download MT4/MT5 trading platform' }
      ],
      existingAccountSteps: [
        { text: 'Contact HFM support to change your IB partner', buttonText: 'Contact Support', buttonLink: 'https://www.hfm.com/en/contact-us' },
        { text: 'Provide your new IB link: https://www.hfm.com/sv/en/open-live-account?refid=corefx' },
        { text: 'Wait for confirmation (usually 1-2 business days)' }
      ],
      isActive: true,
      displayOrder: 1
    }
  })

  const equity = await prisma.broker.upsert({
    where: { slug: 'equity' },
    update: {},
    create: {
      name: 'Equity',
      slug: 'equity',
      description: 'Trade with confidence using Equity\'s advanced trading platform. Access global markets with competitive pricing.',
      logoUrl: '/uploads/equity-logo.png',
      referralLink: 'https://equity.com/register?ref=corefx',
      benefits: [
        'Low commission rates',
        'Advanced charting tools',
        'Mobile trading app',
        'Fast execution',
        '24/5 customer support'
      ],
      newAccountSteps: [
        { text: 'Create a Brokerage Account with this link', buttonText: 'Open Equity Registration', buttonLink: 'https://equity.com/register?ref=corefx' },
        { text: 'Complete identity verification' },
        { text: 'Make your first deposit' },
        { text: 'Start trading with our signals' }
      ],
      existingAccountSteps: [
        { text: 'Email support@equity.com to request partner change' },
        { text: 'Include your account number and new partner link' },
        { text: 'Wait for confirmation email' }
      ],
      isActive: true,
      displayOrder: 2
    }
  })

  console.log('✅ Created 3 brokers (Exness, HFM, Equity)')

  // ============================================
  // COPY TRADING PLATFORMS
  // ============================================
  
  const platform1 = await prisma.copyTradingPlatform.upsert({
    where: { slug: 'exness-copy-trading' },
    update: {},
    create: {
      name: 'Exness Copy Trading',
      slug: 'exness-copy-trading',
      description: 'Professional copy trading platform with 10+ years of experience. Specializes in EUR/USD and GBP/USD pairs.',
      logoUrl: '/uploads/exness-logo.png',
      copyTradingLink: 'https://www.exness.com/copy-trading',
      profitPercentage: 45.8,
      profitShareRate: 20,
      riskLevel: 'MEDIUM',
      minInvestment: 500,
      strategy: 'Swing Trading',
      roi: 45.8,
      winRate: 68.5,
      maxDrawdown: 15.2,
      isActive: true,
      displayOrder: 0
    }
  })

  const platform2 = await prisma.copyTradingPlatform.upsert({
    where: { slug: 'hfm-copy-trading' },
    update: {},
    create: {
      name: 'HFM Copy Trading',
      slug: 'hfm-copy-trading',
      description: 'Conservative platform focusing on long-term growth. Expert in risk management and capital preservation.',
      logoUrl: '/uploads/hfm-logo.png',
      copyTradingLink: 'https://www.hfm.com/copy-trading',
      profitPercentage: 38.2,
      profitShareRate: 15,
      riskLevel: 'LOW',
      minInvestment: 300,
      strategy: 'Position Trading',
      roi: 38.2,
      winRate: 72.3,
      maxDrawdown: 8.5,
      isActive: true,
      displayOrder: 1
    }
  })

  const platform3 = await prisma.copyTradingPlatform.upsert({
    where: { slug: 'equity-copy-trading' },
    update: {},
    create: {
      name: 'Equity Copy Trading',
      slug: 'equity-copy-trading',
      description: 'Aggressive scalping platform with high-frequency trading strategies. Best for experienced traders.',
      logoUrl: '/uploads/equity-logo.png',
      copyTradingLink: 'https://www.equity.com/copy-trading',
      profitPercentage: 62.5,
      profitShareRate: 25,
      riskLevel: 'HIGH',
      minInvestment: 1000,
      strategy: 'Scalping',
      roi: 62.5,
      winRate: 65.8,
      maxDrawdown: 22.3,
      isActive: true,
      displayOrder: 2
    }
  })

  console.log('✅ Created 3 copy trading platforms')

  // ============================================
  // AFFILIATE PROGRAMS (User-based)
  // ============================================
  
  const brianAffiliate = await prisma.affiliateProgram.upsert({
    where: { userId: brian.id },
    update: {},
    create: {
      userId: brian.id,
      affiliateCode: 'BRIAN2024',
      tier: 'BRONZE',
      commissionRate: 10,
      totalEarnings: 0,
      pendingEarnings: 0,
      paidEarnings: 0,
      totalReferrals: 0,
      isActive: true
    }
  })

  const user1Affiliate = await prisma.affiliateProgram.upsert({
    where: { userId: users[1].id },
    update: {},
    create: {
      userId: users[1].id,
      affiliateCode: 'USER1REF',
      tier: 'SILVER',
      commissionRate: 15,
      totalEarnings: 250.50,
      pendingEarnings: 50.00,
      paidEarnings: 200.50,
      totalReferrals: 12,
      isActive: true
    }
  })

  console.log('✅ Created 2 affiliate programs')

  // ============================================
  // ACADEMY COURSES
  // ============================================
  
  await prisma.course.upsert({
    where: { slug: 'forex-trading-fundamentals' },
    update: {},
    create: {
      title: 'Forex Trading Fundamentals',
      slug: 'forex-trading-fundamentals',
      description: 'Master the basics of forex trading from scratch. Perfect for beginners.',
      priceUSD: 0,
      level: 'BEGINNER',
      status: 'PUBLISHED',
      instructor: 'XEN TradeHub',
      isFree: true,
      duration: 3600,
      totalLessons: 8,
      tags: ['forex', 'beginner', 'fundamentals']
    }
  })

  await prisma.course.upsert({
    where: { slug: 'technical-analysis-mastery' },
    update: {},
    create: {
      title: 'Technical Analysis Mastery',
      slug: 'technical-analysis-mastery',
      description: 'Learn advanced charting techniques and technical indicators used by professionals.',
      priceUSD: 199,
      level: 'INTERMEDIATE',
      status: 'PUBLISHED',
      instructor: 'XEN TradeHub',
      isFree: false,
      duration: 7200,
      totalLessons: 12,
      tags: ['technical-analysis', 'intermediate', 'charts']
    }
  })

  await prisma.course.upsert({
    where: { slug: 'risk-management-psychology' },
    update: {},
    create: {
      title: 'Risk Management & Psychology',
      slug: 'risk-management-psychology',
      description: 'Protect your capital and master the mental game of trading.',
      priceUSD: 149,
      level: 'ADVANCED',
      status: 'PUBLISHED',
      instructor: 'XEN TradeHub',
      isFree: false,
      duration: 5400,
      totalLessons: 10,
      tags: ['risk-management', 'psychology', 'advanced']
    }
  })

  console.log('✅ Created 3 academy courses')

  // ============================================
  // SAMPLE DATA
  // ============================================

  // ============================================
  // BROKER ACCOUNT OPENINGS
  // ============================================
  
  await prisma.brokerAccountOpening.create({
    data: {
      brokerId: exness.id,
      userId: brian.id,
      fullName: 'Brian Amooti',
      email: 'brian@corefx.com',
      phone: '+256700000000',
      accountId: 'EXN123456',
      status: 'APPROVED',
      notes: 'Verified and active'
    }
  })

  await prisma.brokerAccountOpening.create({
    data: {
      brokerId: hfm.id,
      userId: users[1].id,
      fullName: users[1].name || 'Test User 1',
      email: users[1].email,
      phone: '+1234567890',
      accountId: 'HFM789012',
      status: 'PENDING',
      notes: 'Awaiting verification'
    }
  })

  await prisma.brokerAccountOpening.create({
    data: {
      brokerId: equity.id,
      userId: users[2].id,
      fullName: users[2].name || 'Test User 2',
      email: users[2].email,
      phone: '+1234567891',
      accountId: 'EQT345678',
      status: 'APPROVED',
      notes: 'Account verified'
    }
  })

  await prisma.brokerAccountOpening.create({
    data: {
      brokerId: exness.id,
      userId: users[3].id,
      fullName: users[3].name || 'Test User 3',
      email: users[3].email,
      phone: '+1234567892',
      accountId: null,
      status: 'PENDING',
      notes: 'New application'
    }
  })

  console.log('✅ Created 4 broker account openings')

  // ============================================
  // COPY TRADING SUBSCRIPTIONS
  // ============================================
  
  await prisma.copyTradingSubscription.create({
    data: {
      platformId: platform1.id,
      userId: brian.id,
      investmentUSD: 5000,
      status: 'ACTIVE',
      startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // 30 days ago
    }
  })

  await prisma.copyTradingSubscription.create({
    data: {
      platformId: platform1.id,
      userId: users[1].id,
      investmentUSD: 1000,
      status: 'ACTIVE',
      startDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000) // 15 days ago
    }
  })

  await prisma.copyTradingSubscription.create({
    data: {
      platformId: platform2.id,
      userId: users[2].id,
      investmentUSD: 2500,
      status: 'ACTIVE',
      startDate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000) // 20 days ago
    }
  })

  await prisma.copyTradingSubscription.create({
    data: {
      platformId: platform3.id,
      userId: users[3].id,
      investmentUSD: 3000,
      status: 'ACTIVE',
      startDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000) // 10 days ago
    }
  })

  await prisma.copyTradingSubscription.create({
    data: {
      platformId: platform2.id,
      userId: users[4].id,
      investmentUSD: 1500,
      status: 'PAUSED',
      startDate: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000), // 45 days ago
      endDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) // 5 days ago
    }
  })

  console.log('✅ Created 5 copy trading subscriptions')

  // ============================================
  // AFFILIATE REFERRALS & COMMISSIONS
  // ============================================
  
  const referral1 = await prisma.affiliateReferral.create({
    data: {
      affiliateProgramId: brianAffiliate.id,
      referredUserId: users[3].id,
      status: 'ACTIVE',
      conversionDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000)
    }
  })

  const referral2 = await prisma.affiliateReferral.create({
    data: {
      affiliateProgramId: brianAffiliate.id,
      referredUserId: users[4].id,
      status: 'ACTIVE',
      conversionDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
    }
  })

  const referral3 = await prisma.affiliateReferral.create({
    data: {
      affiliateProgramId: user1Affiliate.id,
      referredUserId: users[5].id,
      status: 'ACTIVE',
      conversionDate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000)
    }
  })

  await prisma.affiliateReferral.create({
    data: {
      affiliateProgramId: user1Affiliate.id,
      referredUserId: users[6].id,
      status: 'PENDING'
    }
  })

  // Create affiliate commissions
  await prisma.affiliateCommission.create({
    data: {
      affiliateProgramId: brianAffiliate.id,
      amount: 50.00,
      type: 'REFERRAL',
      description: 'Commission from user referral',
      status: 'PAID'
    }
  })

  await prisma.affiliateCommission.create({
    data: {
      affiliateProgramId: brianAffiliate.id,
      amount: 75.00,
      type: 'REFERRAL',
      description: 'Commission from user referral',
      status: 'PENDING'
    }
  })

  await prisma.affiliateCommission.create({
    data: {
      affiliateProgramId: user1Affiliate.id,
      amount: 100.00,
      type: 'REFERRAL',
      description: 'Commission from user referral',
      status: 'PAID'
    }
  })

  // Create affiliate payouts
  await prisma.affiliatePayout.create({
    data: {
      affiliateProgramId: brianAffiliate.id,
      amount: 50.00,
      status: 'COMPLETED',
      method: 'BANK_TRANSFER'
    }
  })

  await prisma.affiliatePayout.create({
    data: {
      affiliateProgramId: user1Affiliate.id,
      amount: 100.00,
      status: 'COMPLETED',
      method: 'PAYPAL'
    }
  })

  console.log('✅ Created affiliate referrals, commissions, and payouts')

  // ============================================
  // ACADEMY - COURSE ENROLLMENTS
  // ============================================
  
  const courses = await prisma.course.findMany()
  
  await prisma.courseEnrollment.create({
    data: {
      userId: brian.id,
      courseId: courses[0].id,
      progress: 75,
      completed: false
    }
  })

  await prisma.courseEnrollment.create({
    data: {
      userId: brian.id,
      courseId: courses[1].id,
      progress: 100,
      completed: true
    }
  })

  await prisma.courseEnrollment.create({
    data: {
      userId: users[1].id,
      courseId: courses[0].id,
      progress: 30,
      completed: false
    }
  })

  await prisma.courseEnrollment.create({
    data: {
      userId: users[2].id,
      courseId: courses[2].id,
      progress: 50,
      completed: false
    }
  })

  console.log('✅ Created 4 course enrollments')

  // ============================================
  // LIVE ENQUIRIES (Bookings)
  // ============================================
  
  await prisma.booking.create({
    data: {
      userId: brian.id,
      title: 'Consultation: Advanced Trading Strategies',
      date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
      status: 'CONFIRMED'
    }
  })

  await prisma.booking.create({
    data: {
      userId: users[1].id,
      title: 'Help with Risk Management',
      date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
      status: 'PENDING'
    }
  })

  await prisma.booking.create({
    data: {
      userId: users[2].id,
      title: 'Copy Trading Introduction',
      date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
      status: 'PENDING'
    }
  })

  await prisma.booking.create({
    data: {
      userId: users[3].id,
      title: 'Broker Selection & Account Setup',
      date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      status: 'COMPLETED'
    }
  })

  await prisma.booking.create({
    data: {
      userId: users[4].id,
      title: 'One-on-One Forex Mentorship',
      date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // 1 day from now
      status: 'CANCELLED'
    }
  })

  console.log('✅ Created 5 live enquiries (bookings)')

  // ============================================
  // NOTIFICATIONS
  // ============================================
  
  await prisma.notification.create({
    data: {
      userId: brian.id,
      title: 'Welcome to XEN TradeHub!',
      message: 'Thank you for joining our trading community. Explore our features and start your trading journey.',
      type: 'WELCOME',
      isRead: true
    }
  })

  await prisma.notification.create({
    data: {
      userId: brian.id,
      title: 'Broker Account Approved',
      message: 'Your Exness account opening request has been approved. You can now start trading.',
      type: 'ACCOUNT',
      isRead: false
    }
  })

  await prisma.notification.create({
    data: {
      userId: users[1].id,
      title: 'New Trading Signal',
      message: 'EUR/USD Buy signal has been posted. Check it out now!',
      type: 'SIGNAL',
      isRead: false
    }
  })

  await prisma.notification.create({
    data: {
      userId: users[2].id,
      title: 'Course Enrollment Successful',
      message: 'You have successfully enrolled in Risk Management & Psychology course.',
      type: 'COURSE',
      isRead: true
    }
  })

  console.log('✅ Created 4 notifications')

  console.log('\n🎉 Seed completed successfully!')
  console.log('==========================================')
  console.log('📊 Summary:')
  console.log(`   • ${users.length + 1} users created`)
  console.log('   • 3 brokers (Exness, HFM, Equity)')
  console.log('   • 3 master traders')
  console.log('   • 2 affiliate programs')
  console.log('   • 3 academy courses')
  console.log('   • 4 broker account openings')
  console.log('   • 5 copy trading subscriptions')
  console.log('   • 4 affiliate referrals')
  console.log('   • 3 affiliate commissions')
  console.log('   • 2 affiliate payouts')
  console.log('   • 4 course enrollments')
  console.log('   • 5 live enquiries (bookings)')
  console.log('   • 4 notifications')
  console.log('==========================================')
  console.log('\n🔑 Login Credentials:')
  console.log('   Super Admin: admin@corefx.com / admin123')
  console.log('   Brian User:  brian@corefx.com / admin123')
  console.log('   Test Users:  user1@example.com / user123')
  console.log('==========================================\n')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
