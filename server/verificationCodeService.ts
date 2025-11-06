import crypto from 'crypto';
import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';

/**
 * Verification Code Service for pre-submission email verification
 * Generates 6-digit codes, stores them temporarily, and sends via email
 */

interface VerificationCode {
  code: string;
  email: string;
  expiresAt: number;
  attempts: number;
}

interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
  from: string;
}

// In-memory storage for verification codes (ephemeral, 10-minute lifespan)
const verificationCodes = new Map<string, VerificationCode>();

// Cleanup interval to remove expired codes
setInterval(() => {
  const now = Date.now();
  const entries = Array.from(verificationCodes.entries());
  for (const [email, data] of entries) {
    if (data.expiresAt < now) {
      verificationCodes.delete(email);
    }
  }
}, 60000); // Cleanup every minute

/**
 * Generate a random 6-digit verification code
 */
function generateCode(): string {
  return crypto.randomInt(100000, 999999).toString();
}

/**
 * Get email configuration from environment variables
 */
function getEmailConfig(): EmailConfig {
  const config: EmailConfig = {
    host: process.env.SMTP_HOST || '',
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER || '',
      pass: process.env.SMTP_PASS || '',
    },
    from: process.env.SMTP_FROM || process.env.SMTP_USER || '',
  };

  return config;
}

/**
 * Create nodemailer transporter
 */
function createTransporter(): Transporter | null {
  const config = getEmailConfig();
  
  // Check if SMTP is configured
  if (!config.host || !config.auth.user || !config.auth.pass) {
    console.warn('[Verification Code Service] SMTP not configured. Emails will not be sent.');
    return null;
  }

  try {
    const transporter = nodemailer.createTransport(config);
    return transporter;
  } catch (error) {
    console.error('[Verification Code Service] Failed to create email transporter:', error);
    return null;
  }
}

/**
 * Email templates for verification codes
 */
const emailTemplates = {
  en: {
    subject: 'Your Verification Code - Automat-IA',
    html: (code: string, formType: string) => `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #0A8754; color: white; padding: 20px; text-align: center; }
          .content { background-color: #f9f9f9; padding: 30px; margin-top: 20px; }
          .code { font-size: 32px; font-weight: bold; color: #0A8754; text-align: center; letter-spacing: 8px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Automat-IA</h1>
          </div>
          <div class="content">
            <p>Your verification code for the ${formType === 'tfa' ? 'Technical Feasibility Assessment' : 'Process Insight Form'} is:</p>
            <div class="code">${code}</div>
            <p><strong>This code will expire in 10 minutes.</strong></p>
            <p>Enter this code in the form to verify your email address and continue with your submission.</p>
            <p>If you didn't request this code, you can safely ignore this email.</p>
          </div>
          <div class="footer">
            <p>This is an automated message from Automat-IA. Please do not reply to this email.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  },
  es: {
    subject: 'Tu Código de Verificación - Automat-IA',
    html: (code: string, formType: string) => `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #0A8754; color: white; padding: 20px; text-align: center; }
          .content { background-color: #f9f9f9; padding: 30px; margin-top: 20px; }
          .code { font-size: 32px; font-weight: bold; color: #0A8754; text-align: center; letter-spacing: 8px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Automat-IA</h1>
          </div>
          <div class="content">
            <p>Tu código de verificación para ${formType === 'tfa' ? 'la Evaluación de Viabilidad Técnica' : 'el Formulario de Perspectivas del Proceso'} es:</p>
            <div class="code">${code}</div>
            <p><strong>Este código expirará en 10 minutos.</strong></p>
            <p>Ingresa este código en el formulario para verificar tu dirección de correo electrónico y continuar con tu envío.</p>
            <p>Si no solicitaste este código, puedes ignorar este correo de forma segura.</p>
          </div>
          <div class="footer">
            <p>Este es un mensaje automatizado de Automat-IA. Por favor, no respondas a este correo.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  },
};

/**
 * Send verification code via email
 */
export async function sendVerificationCode(
  email: string,
  formType: 'tfa' | 'pif',
  language: 'en' | 'es' = 'en'
): Promise<{ success: boolean; message: string }> {
  // Generate new code
  const code = generateCode();
  const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

  // Store code
  verificationCodes.set(email, {
    code,
    email,
    expiresAt,
    attempts: 0,
  });

  // Create transporter
  const transporter = createTransporter();
  if (!transporter) {
    console.warn('[Verification Code Service] SMTP not configured, code generated but not sent:', code);
    return {
      success: false,
      message: 'Email service not configured. Please contact support.',
    };
  }

  // Get template
  const template = emailTemplates[language];

  try {
    await transporter.sendMail({
      from: getEmailConfig().from,
      to: email,
      subject: template.subject,
      html: template.html(code, formType),
    });

    console.log(`[Verification Code Service] Code sent to ${email}`);
    return {
      success: true,
      message: 'Verification code sent successfully',
    };
  } catch (error) {
    console.error('[Verification Code Service] Failed to send email:', error);
    return {
      success: false,
      message: 'Failed to send verification email. Please try again.',
    };
  }
}

/**
 * Verify a code
 */
export function verifyCode(email: string, code: string): { success: boolean; message: string } {
  const stored = verificationCodes.get(email);

  if (!stored) {
    return {
      success: false,
      message: 'No verification code found for this email. Please request a new code.',
    };
  }

  // Check if expired
  if (stored.expiresAt < Date.now()) {
    verificationCodes.delete(email);
    return {
      success: false,
      message: 'Verification code has expired. Please request a new code.',
    };
  }

  // Check attempts
  if (stored.attempts >= 5) {
    verificationCodes.delete(email);
    return {
      success: false,
      message: 'Too many failed attempts. Please request a new code.',
    };
  }

  // Verify code
  if (stored.code === code) {
    verificationCodes.delete(email);
    return {
      success: true,
      message: 'Email verified successfully',
    };
  } else {
    stored.attempts++;
    return {
      success: false,
      message: 'Invalid verification code. Please try again.',
    };
  }
}
