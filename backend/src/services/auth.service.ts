import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/database';
import { config } from '../config';
import { EmailService } from './email.service';
import crypto from 'crypto';

export class AuthService {
  static generateTokens(userId: string) {
    const accessToken = jwt.sign({ userId }, config.jwt.accessSecret, { expiresIn: config.jwt.accessExpiresIn as any });
    const refreshToken = jwt.sign({ userId }, config.jwt.refreshSecret, { expiresIn: config.jwt.refreshExpiresIn as any });
    return { accessToken, refreshToken };
  }

  static async register(email: string, passwordHash: string, name: string) {
    // Multi-tenant: Every account gets its OWN isolated Organization & Client workspace
    const orgName = `${name || 'Client'}'s Organization`;
    const org = await prisma.organization.create({
      data: {
        name: orgName,
        email: email,
        entityType: 'PRIVATE_LIMITED',
        subscriptionTier: 'FREE'
      }
    });

    const userCode = 'USR-' + Math.floor(10000 + Math.random() * 90000).toString();
    const user = await prisma.user.create({
      data: {
        userCode,
        email,
        passwordHash,
        name,
        organizationId: org.id,
        emailVerified: true,
        authProvider: 'EMAIL',
        role: 'OWNER'
      }
    });

    // Auto-create initial isolated company for this user
    await prisma.client.create({
      data: {
        organizationId: org.id,
        name: `${name || 'My'} Enterprises Pvt Ltd`,
        entityType: 'PRIVATE_LIMITED',
        email: email,
        city: 'New Delhi',
        state: 'Delhi',
        isActive: true
      }
    });

    return user;
  }

  static generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  static async sendOtp(email: string) {
    const otp = this.generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await prisma.emailVerificationToken.upsert({
      where: {
        email_token: {
          email,
          token: otp
        }
      },
      update: {
        token: otp,
        expiresAt
      },
      create: {
        email,
        token: otp,
        expiresAt
      }
    });

    await EmailService.sendOtpEmail(email, otp);
  }

  static async verifyOtp(email: string, otp: string) {
    const record = await prisma.emailVerificationToken.findFirst({
      where: { email, token: otp },
      orderBy: { createdAt: 'desc' }
    });

    if (!record) {
      throw new Error('Invalid OTP');
    }

    if (new Date() > record.expiresAt) {
      throw new Error('OTP has expired');
    }

    // Mark user as verified
    await prisma.user.update({
      where: { email },
      data: { emailVerified: true }
    });

    // Delete token
    await prisma.emailVerificationToken.delete({ where: { id: record.id } });

    return true;
  }

  static async sendPasswordReset(email: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return; // Silent return for security

    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    await prisma.passwordResetToken.create({
      data: {
        email,
        token,
        expiresAt
      }
    });

    await EmailService.sendPasswordResetEmail(email, token);
  }

  static async resetPassword(token: string, passwordHash: string) {
    const record = await prisma.passwordResetToken.findUnique({ where: { token } });
    
    if (!record) {
      throw new Error('Invalid or expired reset token');
    }

    if (new Date() > record.expiresAt) {
      await prisma.passwordResetToken.delete({ where: { id: record.id } });
      throw new Error('Reset token has expired');
    }

    await prisma.user.update({
      where: { email: record.email },
      data: { passwordHash }
    });

    await prisma.passwordResetToken.deleteMany({ where: { email: record.email } });

    return true;
  }

  static async findOrCreateOAuthUser(provider: string, profile: any) {
    const email = profile.emails?.[0]?.value?.trim().toLowerCase();
    const providerId = profile.id;
    const name = profile.displayName || profile.username || 'User';
    const avatarUrl = profile.photos?.[0]?.value;

    if (!email) {
      throw new Error('Email is required from OAuth provider');
    }

    let user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      const orgName = `${name || 'Client'}'s Organization`;
      const org = await prisma.organization.create({
        data: {
          name: orgName,
          email: email,
          entityType: 'PRIVATE_LIMITED',
          subscriptionTier: 'FREE'
        }
      });

      const userCode = 'USR-' + Math.floor(10000 + Math.random() * 90000).toString();
      user = await prisma.user.create({
        data: {
          userCode,
          email,
          name,
          avatarUrl,
          organizationId: org.id,
          authProvider: provider.toUpperCase() as any,
          providerId,
          emailVerified: true,
          role: 'OWNER'
        }
      });

      // Auto-create initial isolated company for this user
      await prisma.client.create({
        data: {
          organizationId: org.id,
          name: `${name || 'My'} Enterprises Pvt Ltd`,
          entityType: 'PRIVATE_LIMITED',
          email: email,
          city: 'New Delhi',
          state: 'Delhi',
          isActive: true
        }
      });
    }

    // Link OAuth account
    await prisma.oAuthAccount.upsert({
      where: {
        provider_providerAccountId: {
          provider,
          providerAccountId: providerId
        }
      },
      update: {},
      create: {
        userId: user.id,
        provider,
        providerAccountId: providerId
      }
    });

    return user;
  }
}
