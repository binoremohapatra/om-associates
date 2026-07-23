import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth';
import passport from 'passport';
import { AuthService } from '../services/auth.service';
import { prisma } from '../config/database';
import { config } from '../config';

const router = Router();

// Local Auth
router.post('/register', AuthController.register);
router.post('/login', AuthController.login);
router.post('/logout', AuthController.logout);
router.post('/refresh', AuthController.refresh);

// OTP & Password
router.post('/send-otp', AuthController.sendOtp);
router.post('/verify-otp', AuthController.verifyOtp);
router.post('/forgot-password', AuthController.forgotPassword);
router.post('/reset-password', AuthController.resetPassword);

// Profile
router.get('/me', authenticate, AuthController.me);

// OAuth Helper
const oauthCallbackHandler = async (req: any, res: any) => {
  const user = req.user;
  if (!user) {
    return res.redirect(`${config.server.corsOrigins[0]}/login?error=oauth_failed`);
  }

  const { accessToken, refreshToken } = AuthService.generateTokens(user.id);
  
  await prisma.session.create({
    data: {
      userId: user.id,
      token: accessToken,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15m
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    }
  });

  await prisma.refreshToken.create({
    data: {
      userId: user.id,
      token: refreshToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    }
  });

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

  // Redirect to frontend with access token
  res.redirect(`${config.server.corsOrigins[0]}/oauth-callback?token=${accessToken}`);
};

// Google OAuth
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/google/callback', passport.authenticate('google', { session: false, failureRedirect: '/login' }), oauthCallbackHandler);

// Facebook OAuth
router.get('/facebook', passport.authenticate('facebook', { scope: ['email'] }));
router.get('/facebook/callback', passport.authenticate('facebook', { session: false, failureRedirect: '/login' }), oauthCallbackHandler);

// GitHub OAuth
router.get('/github', passport.authenticate('github', { scope: ['user:email'] }));
router.get('/github/callback', passport.authenticate('github', { session: false, failureRedirect: '/login' }), oauthCallbackHandler);

// Microsoft OAuth
router.get('/microsoft', passport.authenticate('microsoft', { scope: ['user.read'] }));
router.get('/microsoft/callback', passport.authenticate('microsoft', { session: false, failureRedirect: '/login' }), oauthCallbackHandler);

export default router;
