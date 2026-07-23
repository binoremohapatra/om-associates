import { prisma } from '../config/database';
import { UserRole } from '@prisma/client';
import { NotFoundError } from '../types/errors';

export class UserService {
  static async updateProfile(userId: string, data: { name?: string; avatarUrl?: string }) {
    const user = await prisma.user.update({
      where: { id: userId },
      data,
      select: { id: true, name: true, email: true, avatarUrl: true, role: true },
    });
    return user;
  }

  static async listOrganizationUsers(organizationId: string) {
    return prisma.user.findMany({
      where: { organizationId },
      select: { id: true, name: true, email: true, role: true, isActive: true, avatarUrl: true, createdAt: true },
    });
  }

  static async updateRole(adminId: string, targetUserId: string, newRole: UserRole) {
    const targetUser = await prisma.user.findUnique({
      where: { id: targetUserId },
      select: { organizationId: true, role: true },
    });
    
    if (!targetUser) throw new NotFoundError('User not found');

    const admin = await prisma.user.findUnique({ where: { id: adminId } });
    if (!admin || admin.organizationId !== targetUser.organizationId) {
      throw new NotFoundError('User not found in your organization');
    }

    if (admin.role !== UserRole.OWNER) {
      throw new Error('Only the organization OWNER can change roles');
    }

    if (targetUser.role === UserRole.OWNER) {
      throw new Error('Cannot change the role of an OWNER');
    }

    return prisma.user.update({
      where: { id: targetUserId },
      data: { role: newRole },
      select: { id: true, name: true, role: true },
    });
  }

  static async getDashboardAnalytics(organizationId: string) {
    // Basic stub for the dashboard
    return {
      activeClients: await prisma.client.count({ where: { organizationId, isActive: true } }),
      pendingInvoices: await prisma.invoice.count({ where: { organizationId, status: 'SENT' } }),
      unresolvedFilings: await prisma.gstFiling.count({ where: { client: { organizationId }, status: 'PENDING' } }),
    };
  }
}
