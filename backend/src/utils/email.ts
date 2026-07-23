import nodemailer from 'nodemailer';
import { config } from '../config';
import { logger } from '../config/logger';

let transporter: nodemailer.Transporter | null = null;

export async function getTransporter(): Promise<nodemailer.Transporter> {
  if (transporter) return transporter;

  if (config.email.host && config.email.user && config.email.pass) {
    transporter = nodemailer.createTransport({
      host: config.email.host,
      port: config.email.port,
      secure: config.email.port === 465, // true for 465, false for other ports
      auth: {
        user: config.email.user,
        pass: config.email.pass,
      },
    });
  } else if (config.isDev) {
    // Generate an Ethereal test account on the fly for development
    logger.info('No SMTP credentials provided. Creating Ethereal test account...');
    const testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
    logger.info(`Ethereal test account created: ${testAccount.user}`);
  } else {
    throw new Error('No SMTP credentials configured for production!');
  }

  return transporter;
}

export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: SendEmailOptions): Promise<void> {
  try {
    const t = await getTransporter();
    const info = await t.sendMail({
      from: `"TaxOS Support" <${config.email.from}>`,
      to,
      subject,
      html,
    });

    if (config.isDev) {
      logger.info(`Email sent! Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
    }
  } catch (err) {
    logger.error({ err, to, subject }, 'Failed to send email');
    throw err;
  }
}
