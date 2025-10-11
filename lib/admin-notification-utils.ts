import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export interface AdminNotificationData {
  type: 'STUDENT_PURCHASE' | 'STUDENT_ENROLLMENT' | 'STUDENT_REGISTRATION' | 'STUDENT_ENQUIRY' | 'STUDENT_ACTIVITY'
  title: string
  message: string
  actionUrl?: string
  studentId?: string
  studentName?: string
  studentEmail?: string
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
 * Create admin notification for student purchase
 */
export async function notifyStudentPurchase(
  studentName: string,
  studentEmail: string,
  itemType: string,
  itemName: string,
  amount: number,
  currency: string = 'USD',
  actionUrl?: string
) {
  return createAdminActivityNotification({
    type: 'STUDENT_PURCHASE',
    title: 'New Student Purchase',
    message: `${studentName} (${studentEmail}) purchased ${itemType}: "${itemName}" for ${currency} ${amount}`,
    actionUrl,
    studentName,
    studentEmail
  })
}

/**
 * Create admin notification for student enrollment
 */
export async function notifyStudentEnrollment(
  studentName: string,
  studentEmail: string,
  courseName: string,
  actionUrl?: string
) {
  return createAdminActivityNotification({
    type: 'STUDENT_ENROLLMENT',
    title: 'New Student Enrollment',
    message: `${studentName} (${studentEmail}) enrolled in course: "${courseName}"`,
    actionUrl,
    studentName,
    studentEmail
  })
}

/**
 * Create admin notification for student registration
 */
export async function notifyStudentRegistration(
  studentName: string,
  studentEmail: string,
  eventType: string,
  eventName: string,
  actionUrl?: string
) {
  return createAdminActivityNotification({
    type: 'STUDENT_REGISTRATION',
    title: 'New Student Registration',
    message: `${studentName} (${studentEmail}) registered for ${eventType}: "${eventName}"`,
    actionUrl,
    studentName,
    studentEmail
  })
}

/**
 * Create admin notification for student enquiry
 */
export async function notifyStudentEnquiry(
  studentName: string,
  studentEmail: string,
  enquiryType: string,
  message: string,
  actionUrl?: string
) {
  return createAdminActivityNotification({
    type: 'STUDENT_ENQUIRY',
    title: 'New Student Enquiry',
    message: `${studentName} (${studentEmail}) sent ${enquiryType} enquiry: "${message.substring(0, 100)}${message.length > 100 ? '...' : ''}"`,
    actionUrl,
    studentName,
    studentEmail
  })
}

/**
 * Create admin notification for general student activity
 */
export async function notifyStudentActivity(
  studentName: string,
  studentEmail: string,
  activity: string,
  actionUrl?: string
) {
  return createAdminActivityNotification({
    type: 'STUDENT_ACTIVITY',
    title: 'Student Activity',
    message: `${studentName} (${studentEmail}) ${activity}`,
    actionUrl,
    studentName,
    studentEmail
  })
}
