import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/database';
import { AuthService } from '../services/auth.service';
import { sendSuccess, sendCreated, sendNoContent } from '../utils/helpers';
import { UnauthorizedError, ConflictError, BadRequestError } from '../types/errors';
import { UserRole, AuthProvider } from '@prisma/client';
import { config } from '../config';
import path from 'path';

export class AuthController {
  static async register(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password, name, organizationName } = req.body;

      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (existingUser) {
        throw new ConflictError('Email already in use');
      }

      const passwordHash = await AuthService.hashPassword(password);

      // Create Org + Owner User atomically
      const user = await prisma.$transaction(async (tx) => {
        const org = await tx.organization.create({
          data: { name: organizationName || `${name}'s Organization`, email },
        });

        return tx.user.create({
          data: {
            email,
            passwordHash,
            name,
            role: UserRole.OWNER,
            organizationId: org.id,
            authProvider: AuthProvider.EMAIL,
          },
        });
      });

      const tokens = await AuthService.generateTokens(user);
      
      res.cookie('refreshToken', tokens.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      sendCreated(res, {
        accessToken: tokens.accessToken,
        user: { id: user.id, email: user.email, role: user.role, organizationId: user.organizationId },
      });
    } catch (err) {
      next(err);
    }
  }

  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;

      const user = await prisma.user.findUnique({ where: { email } });
      if (!user || !user.isActive) {
        throw new UnauthorizedError('Invalid credentials');
      }

      if (user.authProvider === AuthProvider.GOOGLE && !user.passwordHash) {
        throw new UnauthorizedError('This account is registered via Google. Please use "Continue with Google" to log in.');
      }

      if (!user.passwordHash) {
        throw new UnauthorizedError('Invalid credentials');
      }

      const isValid = await AuthService.verifyPassword(password, user.passwordHash);
      if (!isValid) {
        throw new UnauthorizedError('Invalid credentials');
      }

      const tokens = await AuthService.generateTokens(user);

      res.cookie('refreshToken', tokens.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      sendSuccess(res, {
        accessToken: tokens.accessToken,
        user: { id: user.id, email: user.email, role: user.role, organizationId: user.organizationId },
      });
    } catch (err) {
      next(err);
    }
  }

  static async googleCallback(req: Request, res: Response, next: NextFunction) {
    try {
      const userProfile = req.user; // populated by passport
      if (!userProfile) {
        throw new UnauthorizedError('Google authentication failed');
      }

      const tokens = await AuthService.handleGoogleAuth(userProfile);

      res.cookie('refreshToken', tokens.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      // Redirect to frontend dashboard with success
      res.redirect(`${config.server.corsOrigins[0]}/dashboard?auth=success`);
    } catch (err) {
      // Redirect to frontend login with error
      res.redirect(`${config.server.corsOrigins[0]}/login?error=auth_failed`);
    }
  }

  static async refresh(req: Request, res: Response, next: NextFunction) {
    try {
      const refreshToken = req.cookies.refreshToken || req.body.refreshToken;
      if (!refreshToken) throw new UnauthorizedError('Refresh token required');

      const tokens = await AuthService.refreshTokens(refreshToken);

      res.cookie('refreshToken', tokens.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      sendSuccess(res, { accessToken: tokens.accessToken });
    } catch (err) {
      res.clearCookie('refreshToken');
      next(err);
    }
  }

  static async logout(req: Request, res: Response, next: NextFunction) {
    try {
      if (req.user) {
        await AuthService.clearRefreshToken(req.user.id);
      }
      res.clearCookie('refreshToken');
      sendNoContent(res);
    } catch (err) {
      next(err);
    }
  }

  static async me(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: req.user!.id },
        include: { organization: true }
      });
      if (!user) throw new UnauthorizedError();
      sendSuccess(res, { user });
    } catch (err) {
      next(err);
    }
  }
  static async updateProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, phone, jobTitle } = req.body;
      const user = await prisma.user.update({
        where: { id: req.user!.id },
        data: { name, phone, jobTitle },
        select: { id: true, email: true, name: true, phone: true, jobTitle: true, avatarUrl: true, role: true, organizationId: true, authProvider: true, organization: true },
      });
      sendSuccess(res, { user });
    } catch (err) {
      next(err);
    }
  }

  static async uploadAvatar(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.file) throw new BadRequestError('No image file uploaded');
      // The file is saved to uploads/avatars/ by multer
      const avatarUrl = `/uploads/avatars/${req.file.filename}`;
      const user = await prisma.user.update({
        where: { id: req.user!.id },
        data: { avatarUrl },
        select: { id: true, email: true, name: true, phone: true, jobTitle: true, avatarUrl: true, role: true, organizationId: true, authProvider: true, organization: true },
      });
      sendSuccess(res, { user });
    } catch (err) {
      next(err);
    }
  }

  static async forgotPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { email } = req.body;
      if (!email) throw new BadRequestError('Email is required');

      await AuthService.forgotPassword(email);
      sendSuccess(res, { message: 'If an account exists, a reset link has been sent' });
    } catch (err) {
      next(err);
    }
  }

  static async resetPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, token, newPassword } = req.body;
      if (!email || !token || !newPassword) {
        throw new BadRequestError('Email, token, and newPassword are required');
      }

      await AuthService.resetPassword(email, token, newPassword);
      sendSuccess(res, { message: 'Password reset successful' });
    } catch (err) {
      next(err);
    }
  }

  static async verifyEmail(req: Request, res: Response, next: NextFunction) {
    try {
      const { token } = req.body;
      if (!token) throw new BadRequestError('Token is required');

      await AuthService.verifyEmail(token);
      sendSuccess(res, { message: 'Email verified successfully' });
    } catch (err) {
      next(err);
    }
  }

  static async resendVerification(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new UnauthorizedError();
      await AuthService.initiateEmailVerification(req.user.id);
      sendSuccess(res, { message: 'Verification email sent' });
    } catch (err) {
      next(err);
    }
  }
}



