import nodemailer, { type Transporter } from 'nodemailer';

const SMTP_USER = process.env.SMTP_USER || '';
const SMTP_PASS = process.env.SMTP_PASS || '';

if (!SMTP_USER || !SMTP_PASS) {
  console.warn('⚠️  SMTP_USER / SMTP_PASS not set — email sending will fail');
}

let cached: Transporter | null = null;

export function getTransporter(): Transporter {
  if (cached) return cached;
  cached = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: Number(process.env.SMTP_PORT || 465),
    secure: (process.env.SMTP_SECURE ?? 'true') === 'true',
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  });
  return cached;
}

export const EMAIL_FROM = process.env.EMAIL_FROM || SMTP_USER;
export const EMAIL_MANAGER = process.env.EMAIL_MANAGER || SMTP_USER;
