import { Prisma, UserRole, AuthProvider } from '@prisma/client';
import { prisma } from '../config/database';
import { config } from '../config';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { hashToken } from '../utils/crypto';
import { UnauthorizedError } from '../types/errors';

export class AuthService {
  static async generateTokens(user: { id: string; email: string; role: any; organizationId: string }) {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      orgId: user.organizationId,
    };

    const accessToken = jwt.sign(
      { ...payload, type: 'access' },
      config.jwt.accessSecret,
      { expiresIn: config.jwt.accessExpiresIn as any }
    );

    const refreshToken = jwt.sign(
      { ...payload, type: 'refresh' },
      config.jwt.refreshSecret,
      { expiresIn: config.jwt.refreshExpiresIn as any }
    );

    const refreshTokenHash = hashToken(refreshToken);

    await prisma.user.update({
      where: { id: user.id },
      data: { refreshTokenHash, lastLoginAt: new Date() },
    });

    return { accessToken, refreshToken };
  }

  static async verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  static async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 12);
  }

  static async clearRefreshToken(userId: string) {
    await prisma.user.update({
      where: { id: userId },
      data: { refreshTokenHash: null },
    });
  }

  static async refreshTokens(token: string) {
    try {
      const payload = jwt.verify(token, config.jwt.refreshSecret) as any;
      if (payload.type !== 'refresh') throw new Error();

      const user = await prisma.user.findUnique({ where: { id: payload.sub } });
      if (!user || !user.isActive) throw new UnauthorizedError('User not found or inactive');

      const tokenHash = hashToken(token);
      if (user.refreshTokenHash !== tokenHash) {
        // Potential token reuse / stolen token — wipe all sessions
        await this.clearRefreshToken(user.id);
        throw new UnauthorizedError('Invalid refresh token');
      }

      return this.generateTokens(user);
    } catch {
      throw new UnauthorizedError('Invalid or expired refresh token');
    }
  }

  static async handleGoogleAuth(profile: any) {
    const email = profile.emails[0].value;
    const googleId = profile.id;
    const name = profile.displayName || email.split('@')[0];
    const avatarUrl = profile.photos && profile.photos.length > 0 ? profile.photos[0].value : null;

    let user = await prisma.user.findUnique({ where: { email } });

    if (user) {
      // User exists. Link account if it's currently EMAIL only or update avatar
      if (!user.googleId || user.avatarUrl !== avatarUrl) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: {
            googleId,
            avatarUrl,
            // If they signed up with email first, keep authProvider as EMAIL
            // but now they have a googleId linked so they can log in with both
          },
        });
      }
    } else {
      // User doesn't exist -> Create new Organization + Owner User
      user = await prisma.$transaction(async (tx) => {
        const org = await tx.organization.create({
          data: { name: `${name}'s Organization`, email },
        });

        return tx.user.create({
          data: {
            email,
            name,
            avatarUrl,
            googleId,
            authProvider: AuthProvider.GOOGLE,
            role: UserRole.OWNER,
            organizationId: org.id,
            isEmailVerified: true, // Google verifies emails
          },
        });
      });
    }

    return this.generateTokens(user);
  }

  static async initiateEmailVerification(userId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error('User not found');
    if (user.isEmailVerified) return;

    // Generate 6-digit OTP or crypto random token. Let's use crypto random token.
    const crypto = await import('crypto');
    const token = crypto.randomBytes(32).toString('hex');
    const tokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    await prisma.user.update({
      where: { id: userId },
      data: { emailVerifyToken: token, emailVerifyExpiry: tokenExpiry },
    });

    const { sendEmail } = await import('../utils/email');
    const verificationUrl = `${config.server.corsOrigins[0]}/verify-email?token=${token}`;
    
    await sendEmail({
      to: user.email,
      subject: 'Verify your TaxOS account email',
      html: `<p>Hi ${user.name},</p><p>Please verify your email by clicking the link below:</p><p><a href="${verificationUrl}">${verificationUrl}</a></p>`,
    });
  }

  static async verifyEmail(token: string) {
    const user = await prisma.user.findFirst({
      where: {
        emailVerifyToken: token,
        emailVerifyExpiry: { gt: new Date() },
      },
    });

    if (!user) throw new UnauthorizedError('Invalid or expired verification token');

    await prisma.user.update({
      where: { id: user.id },
      data: {
        isEmailVerified: true,
        emailVerifyToken: null,
        emailVerifyExpiry: null,
      },
    });
  }

  static async forgotPassword(email: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return; // Do not leak user existence

    if (user.authProvider === AuthProvider.GOOGLE && !user.passwordHash) {
      return; // Cannot reset password for pure Google auth users
    }

    const crypto = await import('crypto');
    const token = crypto.randomBytes(32).toString('hex');
    const tokenHash = hashToken(token); // Store hashed token for security
    const tokenExpiry = new Date(Date.now() + 1 * 60 * 60 * 1000); // 1 hour

    await prisma.user.update({
      where: { id: user.id },
      data: { passwordResetToken: tokenHash, passwordResetExpiry: tokenExpiry },
    });

    const { sendEmail } = await import('../utils/email');
    const resetUrl = `${config.server.corsOrigins[0]}/reset-password?token=${token}&email=${encodeURIComponent(email)}`;
    
    await sendEmail({
      to: user.email,
      subject: 'Reset your TaxOS password',
      html: `<p>Hi ${user.name},</p><p>You requested to reset your password. Click the link below:</p><p><a href="${resetUrl}">${resetUrl}</a></p><p>This link expires in 1 hour.</p>`,
    });
  }

  static async resetPassword(email: string, token: string, newPassword: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.passwordResetToken || !user.passwordResetExpiry) {
      throw new UnauthorizedError('Invalid or expired reset token');
    }

    if (user.passwordResetExpiry < new Date()) {
      throw new UnauthorizedError('Reset token has expired');
    }

    const tokenHash = hashToken(token);
    if (user.passwordResetToken !== tokenHash) {
      throw new UnauthorizedError('Invalid reset token');
    }

    const passwordHash = await this.hashPassword(newPassword);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        passwordResetToken: null,
        passwordResetExpiry: null,
        // Optional: clear all active sessions
        refreshTokenHash: null,
      },
    });
  }
}
