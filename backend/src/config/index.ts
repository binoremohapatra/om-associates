import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../../.env') });

function required(key: string): string {
  const val = process.env[key];
  if (!val) throw new Error(`Missing required environment variable: ${key}`);
  return val;
}

function optional(key: string, fallback: string): string {
  return process.env[key] ?? fallback;
}

export const config = {
  env: optional('NODE_ENV', 'development'),
  isDev: optional('NODE_ENV', 'development') === 'development',
  isProd: process.env.NODE_ENV === 'production',

  server: {
    port: parseInt(optional('PORT', '4000'), 10),
    host: optional('HOST', '0.0.0.0'),
    corsOrigins: optional('CORS_ORIGINS', 'http://localhost:3000').split(','),
  },

  database: {
    url: required('DATABASE_URL'),
  },

  redis: {
    url: optional('REDIS_URL', 'redis://localhost:6379'),
    password: process.env.REDIS_PASSWORD,
  },

  jwt: {
    accessSecret: required('JWT_ACCESS_SECRET'),
    refreshSecret: required('JWT_REFRESH_SECRET'),
    accessExpiresIn: optional('JWT_ACCESS_EXPIRES', '15m'),
    refreshExpiresIn: optional('JWT_REFRESH_EXPIRES', '7d'),
  },

  encryption: {
    key: required('ENCRYPTION_KEY'), // 32-byte hex for AES-256-GCM
  },

  email: {
    host: optional('SMTP_HOST', 'smtp.ethereal.email'),
    port: parseInt(optional('SMTP_PORT', '587'), 10),
    user: optional('SMTP_USER', ''),
    pass: optional('SMTP_PASS', ''),
    from: optional('EMAIL_FROM', 'noreply@taxos.in'),
  },

  google: {
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackUrl: process.env.GOOGLE_CALLBACK_URL,
  },

  ai: {
    provider: optional('AI_PROVIDER', 'openai'), // openai | anthropic | stub
    openaiApiKey: process.env.OPENAI_API_KEY ?? '',
    model: optional('AI_MODEL', 'gpt-4o-mini'),
  },

  rateLimit: {
    auth: {
      windowMs: 60 * 1000, // 1 minute
      max: 5,
    },
    api: {
      windowMs: 60 * 1000,
      max: 100,
    },
  },

  pagination: {
    defaultLimit: 20,
    maxLimit: 100,
  },
} as const;
