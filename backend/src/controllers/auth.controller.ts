import { Request, Response, NextFunction } from 'express';
import { sendSuccess } from '../utils/helpers';
import { prisma } from '../config/database';
import { AuthService } from '../services/auth.service';
import bcrypt from 'bcryptjs';

export class AuthController {
  static async register(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password, name } = req.body;
      if (!email || !password || !name) {
        return res.status(400).json({ success: false, error: 'Email, password, and name are required' });
      }

      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (existingUser) {
        if (!existingUser.passwordHash) {
          return res.status(400).json({ success: false, error: 'An account with this email exists via social login. Please sign in with your social provider or use Forgot Password to set a password.' });
        }
        return res.status(400).json({ success: false, error: 'User already exists' });
      }

      const passwordHash = await bcrypt.hash(password, 10);
      const user = await AuthService.register(email, passwordHash, name);
      
      sendSuccess(res, { message: 'Registration successful. You can now log in.' }, 201);
    } catch (err) {
      next(err);
    }
  }

  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ success: false, error: 'Email and password are required' });
      }

      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) {
        return res.status(401).json({ success: false, error: 'Invalid credentials' });
      }

      if (!user.passwordHash) {
        return res.status(401).json({ success: false, error: 'This account uses social login. Please sign in with your social provider or use Forgot Password to set a password.' });
      }

      const isMatch = await bcrypt.compare(password, user.passwordHash);
      if (!isMatch) {
        return res.status(401).json({ success: false, error: 'Invalid credentials' });
      }

      if (!user.emailVerified) {
        return res.status(403).json({ success: false, error: 'Email not verified', errorCode: 'NOT_VERIFIED' });
      }

      const { accessToken, refreshToken } = AuthService.generateTokens(user.id);

      // Create session
      await prisma.session.create({
        data: {
          userId: user.id,
          token: accessToken,
          expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15m
          ipAddress: req.ip,
          userAgent: req.headers['user-agent']
        }
      });

      // Save refresh token
      await prisma.refreshToken.create({
        data: {
          userId: user.id,
          token: refreshToken,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
        }
      });

      // Set Refresh token in httpOnly cookie
      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000
      });

      await prisma.user.update({
        where: { id: user.id },
        data: { lastLoginAt: new Date() }
      });

      sendSuccess(res, { accessToken, user });
    } catch (err) {
      next(err);
    }
  }

  static async sendOtp(req: Request, res: Response, next: NextFunction) {
    try {
      const { email } = req.body;
      if (!email) return res.status(400).json({ success: false, error: 'Email is required' });

      await AuthService.sendOtp(email);
      sendSuccess(res, { message: 'OTP sent successfully' });
    } catch (err) {
      next(err);
    }
  }

  static async verifyOtp(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, otp } = req.body;
      if (!email || !otp) return res.status(400).json({ success: false, error: 'Email and OTP are required' });

      await AuthService.verifyOtp(email, otp);
      sendSuccess(res, { message: 'Email verified successfully' });
    } catch (err) {
      res.status(400).json({ success: false, error: err instanceof Error ? err.message : 'Invalid OTP' });
    }
  }

  static async forgotPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { email } = req.body;
      if (!email) return res.status(400).json({ success: false, error: 'Email is required' });

      await AuthService.sendPasswordReset(email);
      sendSuccess(res, { message: 'If that email is registered, a password reset link has been sent.' });
    } catch (err) {
      next(err);
    }
  }

  static async resetPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { token, password } = req.body;
      if (!token || !password) return res.status(400).json({ success: false, error: 'Token and password are required' });

      const passwordHash = await bcrypt.hash(password, 10);
      await AuthService.resetPassword(token, passwordHash);
      
      sendSuccess(res, { message: 'Password has been reset successfully' });
    } catch (err) {
      res.status(400).json({ success: false, error: err instanceof Error ? err.message : 'Invalid token' });
    }
  }

  static async refresh(req: Request, res: Response, next: NextFunction) {
    try {
      const refreshToken = req.cookies.refreshToken;
      if (!refreshToken) return res.status(401).json({ success: false, error: 'No refresh token' });

      const storedToken = await prisma.refreshToken.findUnique({ where: { token: refreshToken } });
      if (!storedToken || storedToken.revokedAt || new Date() > storedToken.expiresAt) {
        return res.status(401).json({ success: false, error: 'Invalid refresh token' });
      }

      const { accessToken, refreshToken: newRefreshToken } = AuthService.generateTokens(storedToken.userId);

      // Revoke old and create new
      await prisma.refreshToken.update({
        where: { id: storedToken.id },
        data: { revokedAt: new Date(), replacedByToken: newRefreshToken }
      });

      await prisma.refreshToken.create({
        data: {
          userId: storedToken.userId,
          token: newRefreshToken,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        }
      });

      // Create new session for the new access token
      await prisma.session.create({
        data: {
          userId: storedToken.userId,
          token: accessToken,
          expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15m
          ipAddress: req.ip,
          userAgent: req.headers['user-agent']
        }
      });

      res.cookie('refreshToken', newRefreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000
      });

      sendSuccess(res, { accessToken });
    } catch (err) {
      res.status(401).json({ success: false, error: 'Invalid token' });
    }
  }

  static async logout(req: Request, res: Response, next: NextFunction) {
    try {
      const refreshToken = req.cookies.refreshToken;
      if (refreshToken) {
        await prisma.refreshToken.updateMany({
          where: { token: refreshToken },
          data: { revokedAt: new Date() }
        });
        res.clearCookie('refreshToken');
      }

      // Also revoke session if possible (requires extracting access token from header)
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7);
        await prisma.session.deleteMany({ where: { token } });
      }

      sendSuccess(res, { message: 'Logged out successfully' });
    } catch (err) {
      next(err);
    }
  }

  static async me(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }

      const user = await prisma.user.findUnique({
        where: { id: req.user.id },
        include: { organization: true }
      });

      sendSuccess(res, { user });
    } catch (err) {
      next(err);
    }
  }
}
