import { prisma } from '../config/database';

export class PlatformService {
  // --- Contact Form ---
  static async submitContactForm(data: { name: string; email: string; subject: string; message: string }) {
    return prisma.contactMessage.create({
      data: {
        name: data.name,
        email: data.email,
        subject: data.subject,
        message: data.message,
      },
    });
  }

  static async getContactMessages() {
    return prisma.contactMessage.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  // --- GST News ---
  static async getGstNews(organizationId?: string) {
    return prisma.gstNews.findMany({
      where: {
        isPublished: true,
        OR: [{ organizationId: null }, { organizationId }],
      },
      orderBy: { publishedAt: 'desc' },
      take: 20,
    });
  }

  // --- Notifications ---
  static async getNotifications(userId: string) {
    return prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  static async markNotificationRead(notificationId: string, userId: string) {
    return prisma.notification.updateMany({
      where: { id: notificationId, userId },
      data: { isRead: true, readAt: new Date() },
    });
  }
}
