import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export interface UserNotificationData {
  type: 'NEW_BROKER' | 'NEW_ACADEMY_CLASS' | 'NEW_MASTER_TRADER' | 'NEW_COURSE' | 'NEW_RESOURCE' | 'NEW_SIGNAL' | 'NEW_EVENT' | 'AFFILIATE_REFERRAL_SIGNUP' | 'SYSTEM_UPDATE' | 'PROMOTION'
  title: string
  message: string
  actionUrl?: string
}

/**
 * Create user notifications for all students
 */
export async function createUserNotification(data: UserNotificationData, targetUserId?: string) {
  try {
    if (targetUserId) {
      // Send to specific user
      const notification = await prisma.notification.create({
        data: {
          userId: targetUserId,
          title: data.title,
          message: data.message,
          type: data.type,
          actionUrl: data.actionUrl,
          isRead: false
        }
      })
      
      console.log(`Created user notification for user ${targetUserId}`)
      return { success: true, count: 1 }
    } else {
      // Send to all students (non-admin users)
      const students = await prisma.user.findMany({
        where: { 
          role: 'STUDENT'
        },
        select: { id: true }
      })

      if (students.length === 0) {
        console.log('No student users found for notification')
        return { success: false, count: 0 }
      }

      // Create notifications for all students
      const notifications = await prisma.notification.createMany({
        data: students.map(student => ({
          userId: student.id,
          title: data.title,
          message: data.message,
          type: data.type,
          actionUrl: data.actionUrl,
          isRead: false
        }))
      })

      console.log(`Created ${notifications.count} user notifications for ${data.type}`)
      return { success: true, count: notifications.count }
    }
  } catch (error) {
    console.error('Failed to create user notification:', error)
    return { success: false, count: 0 }
  }
}

/**
 * Notify all users about a new broker
 */
export async function notifyNewBroker(
  brokerName: string,
  description: string,
  actionUrl?: string
) {
  return createUserNotification({
    type: 'NEW_BROKER',
    title: 'New Broker Available',
    message: `${brokerName} is now available! ${description}`,
    actionUrl: actionUrl || '/brokers'
  })
}

/**
 * Notify all users about a new academy class
 */
export async function notifyNewAcademyClass(
  className: string,
  date: string,
  actionUrl?: string
) {
  return createUserNotification({
    type: 'NEW_ACADEMY_CLASS',
    title: 'New Academy Class',
    message: `New class "${className}" scheduled for ${date}. Register now!`,
    actionUrl: actionUrl || '/academy'
  })
}

/**
 * Notify all users about a new master trader
 */
export async function notifyNewMasterTrader(
  traderName: string,
  performance: string,
  actionUrl?: string
) {
  return createUserNotification({
    type: 'NEW_MASTER_TRADER',
    title: 'New Master Trader',
    message: `${traderName} is now available for copy trading! ${performance}`,
    actionUrl: actionUrl || '/copy-trading'
  })
}

/**
 * Notify all users about a new course
 */
export async function notifyNewCourse(
  courseName: string,
  description: string,
  actionUrl?: string
) {
  return createUserNotification({
    type: 'NEW_COURSE',
    title: '🎓 New Course Available',
    message: `${courseName}: ${description}`,
    actionUrl: actionUrl || '/courses'
  })
}

/**
 * Notify all users about a new resource
 */
export async function notifyNewResource(
  resourceName: string,
  resourceType: string,
  actionUrl?: string
) {
  return createUserNotification({
    type: 'NEW_RESOURCE',
    title: 'New Resource Available',
    message: `New ${resourceType}: "${resourceName}" is now available`,
    actionUrl: actionUrl || '/resources'
  })
}

/**
 * Notify all users about a new signal
 */
export async function notifyNewSignal(
  symbol: string,
  action: string,
  actionUrl?: string
) {
  return createUserNotification({
    type: 'NEW_SIGNAL',
    title: 'New Trading Signal',
    message: `New ${action} signal for ${symbol}`,
    actionUrl: actionUrl || '/signals'
  })
}

/**
 * Notify all users about a new event
 */
export async function notifyNewEvent(
  eventName: string,
  date: string,
  actionUrl?: string
) {
  return createUserNotification({
    type: 'NEW_EVENT',
    title: 'New Event',
    message: `${eventName} on ${date}. Register now!`,
    actionUrl: actionUrl || '/events'
  })
}

/**
 * Notify affiliate when someone signs up with their referral link
 */
export async function notifyAffiliateReferralSignup(
  affiliateUserId: string,
  newUserName: string,
  newUserEmail: string
) {
  return createUserNotification({
    type: 'AFFILIATE_REFERRAL_SIGNUP',
    title: 'New Referral Signup',
    message: `${newUserName} (${newUserEmail}) signed up using your referral link!`,
    actionUrl: '/dashboard/affiliates'
  }, affiliateUserId)
}

/**
 * Notify users about system updates
 */
export async function notifySystemUpdate(
  title: string,
  message: string,
  actionUrl?: string
) {
  return createUserNotification({
    type: 'SYSTEM_UPDATE',
    title,
    message,
    actionUrl
  })
}

/**
 * Notify users about promotions
 */
export async function notifyPromotion(
  title: string,
  message: string,
  actionUrl?: string
) {
  return createUserNotification({
    type: 'PROMOTION',
    title,
    message,
    actionUrl
  })
}
