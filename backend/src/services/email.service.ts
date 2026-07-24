import { Resend } from 'resend';
import { config } from '../config';

const resend = config.resend.apiKey ? new Resend(config.resend.apiKey) : null;
const fromEmail = config.email.from && config.email.from !== 'noreply@omassociates.com' ? config.email.from : 'onboarding@resend.dev';

export class EmailService {
  static async sendOtpEmail(to: string, otp: string) {
    if (!resend) {
      console.warn(`[EmailService] Resend API key missing. Would send OTP ${otp} to ${to}`);
      return;
    }

    try {
      await resend.emails.send({
        from: fromEmail,
        to,
        subject: 'Your OM Associates Verification Code',
        html: `
          <div style="font-family: sans-serif; padding: 20px;">
            <h2>Verify your email address</h2>
            <p>Your verification code is: <strong>${otp}</strong></p>
            <p>This code will expire in 10 minutes.</p>
          </div>
        `,
      });
    } catch (error) {
      console.error('[EmailService] Failed to send OTP email', error);
      throw new Error('Failed to send verification email');
    }
  }

  static async sendPasswordResetEmail(to: string, token: string) {
    if (!resend) {
      console.warn(`[EmailService] Resend API key missing. Would send Reset Token ${token} to ${to}`);
      return;
    }

    const resetLink = `${config.server.corsOrigins[0]}/auth/reset-password?token=${token}`;

    try {
      await resend.emails.send({
        from: fromEmail,
        to,
        subject: 'Reset your OM Associates password',
        html: `
          <div style="font-family: sans-serif; padding: 20px;">
            <h2>Password Reset Request</h2>
            <p>Click the link below to reset your password:</p>
            <a href="${resetLink}" style="display: inline-block; padding: 10px 20px; background: #C9A94B; color: #fff; text-decoration: none; border-radius: 5px;">Reset Password</a>
            <p>This link will expire in 15 minutes.</p>
            <p>If you did not request this, please ignore this email.</p>
          </div>
        `,
      });
    } catch (error) {
      console.error('[EmailService] Failed to send password reset email', error);
      throw new Error('Failed to send password reset email');
    }
  }
}
