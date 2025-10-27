import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export interface AdminNotificationData {
  type: 'USER_SIGNUP' | 'ACADEMY_REGISTRATION' | 'ACADEMY_ENROLLMENT' | 'BROKER_ACCOUNT_OPENING' | 'COPY_TRADING_SUBSCRIPTION' | 'AFFILIATE_REGISTRATION' | 'AFFILIATE_REFERRAL' | 'USER_ENQUIRY' | 'USER_ACTIVITY'
  title: string
  message: string
  actionUrl?: string
  userId?: string
  userName?: string
  userEmail?: string
}

/**
 * Create admin activity notifications for student activities
 */
export async function createAdminActivityNotification(data: AdminNotificationData) {
  try {
    // Get all admin users to send notification to
    const admins = await prisma.user.findMany({
      where: { 
        role: { in: ['SUPERADMIN', 'ADMIN', 'EDITOR', 'ANALYST', 'SUPPORT'] }
      },
      select: { id: true }
    })

    if (admins.length === 0) {
      console.log('No admin users found for notification')
      return { success: false, count: 0 }
    }

    // Create notifications for all admins
    const notifications = await prisma.notification.createMany({
      data: admins.map(admin => ({
        userId: admin.id,
        title: data.title,
        message: data.message,
        type: data.type,
        actionUrl: data.actionUrl,
        isRead: false
      }))
    })

    console.log(`Created ${notifications.count} admin notifications for ${data.type}`)
    return { success: true, count: notifications.count }
  } catch (error) {
    console.error('Failed to create admin activity notification:', error)
    return { success: false, count: 0 }
  }
}

/**
 * Create admin notification for new user signup
 */
export async function notifyUserSignup(
  userName: string,
  userEmail: string,
  referralCode?: string,
  actionUrl?: string
) {
  const referralMsg = referralCode ? ` using referral code: ${referralCode}` : ''
  return createAdminActivityNotification({
    type: 'USER_SIGNUP',
    title: '🎉 New User Signup',
    message: `${userName} (${userEmail}) just signed up${referralMsg}`,
    actionUrl: actionUrl || '/admin/users',
    userName,
    userEmail
  })
}

/**
 * Create admin notification for academy class registration
 */
export async function notifyAcademyRegistration(
  userName: string,
  userEmail: string,
  className: string,
  actionUrl?: string
) {
  return createAdminActivityNotification({
    type: 'ACADEMY_REGISTRATION',
    title: '📚 New Academy Registration',
    message: `${userName} (${userEmail}) registered for academy class: "${className}"`,
    actionUrl: actionUrl || '/admin/academy',
    userName,
    userEmail
  })
}

/**
 * Create admin notification for broker account opening
 */
export async function notifyBrokerAccountOpening(
  userName: string,
  userEmail: string,
  brokerName: string,
  actionUrl?: string
) {
  return createAdminActivityNotification({
    type: 'BROKER_ACCOUNT_OPENING',
    title: '💼 New Broker Account Opening',
    message: `${userName} (${userEmail}) opened an account with broker: "${brokerName}"`,
    actionUrl: actionUrl || '/admin/brokers',
    userName,
    userEmail
  })
}

/**
 * Create admin notification for copy trading subscription
 */
export async function notifyCopyTradingSubscription(
  userName: string,
  userEmail: string,
  traderName: string,
  actionUrl?: string
) {
  return createAdminActivityNotification({
    type: 'COPY_TRADING_SUBSCRIPTION',
    title: '📈 New Copy Trading Subscription',
    message: `${userName} (${userEmail}) subscribed to copy trader: "${traderName}"`,
    actionUrl: actionUrl || '/admin/copy-trading',
    userName,
    userEmail
  })
}

/**
 * Create admin notification for affiliate registration
 */
export async function notifyAffiliateRegistration(
  userName: string,
  userEmail: string,
  referralCode: string,
  actionUrl?: string
) {
  return createAdminActivityNotification({
    type: 'AFFILIATE_REGISTRATION',
    title: '🤝 New Affiliate Registration',
    message: `${userName} (${userEmail}) registered as an affiliate with code: ${referralCode}`,
    actionUrl: actionUrl || '/admin/affiliates',
    userName,
    userEmail
  })
}

/**
 * Create admin notification for affiliate referral signup
 */
export async function notifyAffiliateReferral(
  referrerName: string,
  referrerEmail: string,
  newUserName: string,
  newUserEmail: string,
  actionUrl?: string
) {
  return createAdminActivityNotification({
    type: 'AFFILIATE_REFERRAL',
    title: '🎯 New Affiliate Referral',
    message: `${newUserName} (${newUserEmail}) signed up using ${referrerName}'s referral link`,
    actionUrl: actionUrl || '/admin/affiliates',
    userName: referrerName,
    userEmail: referrerEmail
  })
}

/**
 * Create admin notification for user enquiry
 */
export async function notifyUserEnquiry(
  userName: string,
  userEmail: string,
  enquiryType: string,
  subject: string,
  actionUrl?: string
) {
  return createAdminActivityNotification({
    type: 'USER_ENQUIRY',
    title: '💬 New User Enquiry',
    message: `${userName} (${userEmail}) sent a ${enquiryType} enquiry: "${subject}"`,
    actionUrl: actionUrl || '/admin/enquiry',
    userName,
    userEmail
  })
}

/**
 * Create admin notification for general user activity
 */
export async function notifyUserActivity(
  userName: string,
  userEmail: string,
  activity: string,
  actionUrl?: string
) {
  return createAdminActivityNotification({
    type: 'USER_ACTIVITY',
    title: 'User Activity',
    message: `${userName} (${userEmail}) ${activity}`,
    actionUrl,
    userName,
    userEmail
  })
}
