import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';

/**
 * Email verification service for TFA and PIF submissions
 * Supports bilingual (English/Spanish) verification emails
 */

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

interface VerificationEmailData {
  recipientEmail: string;
  recipientName: string;
  verificationToken: string;
  formType: 'tfa' | 'pif';
  workflowName: string;
  companyName: string;
  language: 'en' | 'es';
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
    console.warn('[Email Service] SMTP not configured. Emails will not be sent.');
    console.warn('[Email Service] Set SMTP_HOST, SMTP_USER, SMTP_PASS environment variables to enable email verification.');
    return null;
  }

  try {
    const transporter = nodemailer.createTransport(config);
    console.log('[Email Service] Email transporter created successfully');
    return transporter;
  } catch (error) {
    console.error('[Email Service] Failed to create email transporter:', error);
    return null;
  }
}

/**
 * Email templates for verification emails
 */
const emailTemplates = {
  en: {
    tfa: {
      subject: (companyName: string) => `Verify your Technical Feasibility Assessment - ${companyName}`,
      html: (data: VerificationEmailData) => `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body { font-family: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6; color: #1e293b; background-color: #f8fafc; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1); overflow: hidden; }
            .header { background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); color: #ffffff; padding: 32px 24px; text-align: center; }
            .header h1 { margin: 0; font-size: 24px; font-weight: 600; }
            .content { padding: 32px 24px; }
            .content p { margin: 0 0 16px 0; }
            .button-container { text-align: center; margin: 32px 0; }
            .button { display: inline-block; background-color: #0f172a; color: #ffffff; padding: 14px 32px; text-decoration: none; border-radius: 6px; font-weight: 500; }
            .button:hover { background-color: #334155; }
            .footer { background-color: #f1f5f9; padding: 24px; text-align: center; font-size: 14px; color: #64748b; border-top: 1px solid #e2e8f0; }
            .info-box { background-color: #f1f5f9; border-left: 4px solid #0f172a; padding: 16px; margin: 24px 0; border-radius: 4px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Verify Your Assessment Submission</h1>
            </div>
            <div class="content">
              <p>Hello ${data.recipientName},</p>
              <p>Thank you for completing the Technical Feasibility Assessment (TFA) for <strong>${data.companyName}</strong> - <strong>${data.workflowName}</strong>.</p>
              <p>To ensure the authenticity of your submission and include your responses in the diagnostic analysis, please verify your email address by clicking the button below:</p>
              
              <div class="button-container">
                <a href="${getVerificationUrl(data)}" class="button">Verify Email Address</a>
              </div>

              <div class="info-box">
                <p style="margin: 0;"><strong>Important:</strong> Your responses will not be included in the final diagnostic report until your email is verified. This verification link will expire in 7 days.</p>
              </div>

              <p>If you did not submit this assessment, please disregard this email.</p>
              <p>If the button above doesn't work, copy and paste this link into your browser:</p>
              <p style="word-break: break-all; color: #0f172a; font-size: 14px;">${getVerificationUrl(data)}</p>
            </div>
            <div class="footer">
              <p>This is an automated message from the Athenia Diagnostic Platform.</p>
              <p>Please do not reply to this email.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: (data: VerificationEmailData) => `
Hello ${data.recipientName},

Thank you for completing the Technical Feasibility Assessment (TFA) for ${data.companyName} - ${data.workflowName}.

To ensure the authenticity of your submission and include your responses in the diagnostic analysis, please verify your email address by visiting the following link:

${getVerificationUrl(data)}

IMPORTANT: Your responses will not be included in the final diagnostic report until your email is verified. This verification link will expire in 7 days.

If you did not submit this assessment, please disregard this email.

---
This is an automated message from the Athenia Diagnostic Platform.
Please do not reply to this email.
      `,
    },
    pif: {
      subject: (companyName: string) => `Verify your Process Insight Form - ${companyName}`,
      html: (data: VerificationEmailData) => `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body { font-family: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6; color: #1e293b; background-color: #f8fafc; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1); overflow: hidden; }
            .header { background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); color: #ffffff; padding: 32px 24px; text-align: center; }
            .header h1 { margin: 0; font-size: 24px; font-weight: 600; }
            .content { padding: 32px 24px; }
            .content p { margin: 0 0 16px 0; }
            .button-container { text-align: center; margin: 32px 0; }
            .button { display: inline-block; background-color: #0f172a; color: #ffffff; padding: 14px 32px; text-decoration: none; border-radius: 6px; font-weight: 500; }
            .button:hover { background-color: #334155; }
            .footer { background-color: #f1f5f9; padding: 24px; text-align: center; font-size: 14px; color: #64748b; border-top: 1px solid #e2e8f0; }
            .info-box { background-color: #f1f5f9; border-left: 4px solid #0f172a; padding: 16px; margin: 24px 0; border-radius: 4px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Verify Your Assessment Submission</h1>
            </div>
            <div class="content">
              <p>Hello ${data.recipientName},</p>
              <p>Thank you for completing the Process Insight Form (PIF) for <strong>${data.companyName}</strong> - <strong>${data.workflowName}</strong>.</p>
              <p>To ensure the authenticity of your submission and include your responses in the diagnostic analysis, please verify your email address by clicking the button below:</p>
              
              <div class="button-container">
                <a href="${getVerificationUrl(data)}" class="button">Verify Email Address</a>
              </div>

              <div class="info-box">
                <p style="margin: 0;"><strong>Important:</strong> Your responses will not be included in the final diagnostic report until your email is verified. This verification link will expire in 7 days.</p>
              </div>

              <p>If you did not submit this assessment, please disregard this email.</p>
              <p>If the button above doesn't work, copy and paste this link into your browser:</p>
              <p style="word-break: break-all; color: #0f172a; font-size: 14px;">${getVerificationUrl(data)}</p>
            </div>
            <div class="footer">
              <p>This is an automated message from the Athenia Diagnostic Platform.</p>
              <p>Please do not reply to this email.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: (data: VerificationEmailData) => `
Hello ${data.recipientName},

Thank you for completing the Process Insight Form (PIF) for ${data.companyName} - ${data.workflowName}.

To ensure the authenticity of your submission and include your responses in the diagnostic analysis, please verify your email address by visiting the following link:

${getVerificationUrl(data)}

IMPORTANT: Your responses will not be included in the final diagnostic report until your email is verified. This verification link will expire in 7 days.

If you did not submit this assessment, please disregard this email.

---
This is an automated message from the Athenia Diagnostic Platform.
Please do not reply to this email.
      `,
    },
  },
  es: {
    tfa: {
      subject: (companyName: string) => `Verifique su Evaluación de Viabilidad Técnica - ${companyName}`,
      html: (data: VerificationEmailData) => `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body { font-family: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6; color: #1e293b; background-color: #f8fafc; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1); overflow: hidden; }
            .header { background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); color: #ffffff; padding: 32px 24px; text-align: center; }
            .header h1 { margin: 0; font-size: 24px; font-weight: 600; }
            .content { padding: 32px 24px; }
            .content p { margin: 0 0 16px 0; }
            .button-container { text-align: center; margin: 32px 0; }
            .button { display: inline-block; background-color: #0f172a; color: #ffffff; padding: 14px 32px; text-decoration: none; border-radius: 6px; font-weight: 500; }
            .button:hover { background-color: #334155; }
            .footer { background-color: #f1f5f9; padding: 24px; text-align: center; font-size: 14px; color: #64748b; border-top: 1px solid #e2e8f0; }
            .info-box { background-color: #f1f5f9; border-left: 4px solid #0f172a; padding: 16px; margin: 24px 0; border-radius: 4px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Verifique Su Envío de Evaluación</h1>
            </div>
            <div class="content">
              <p>Hola ${data.recipientName},</p>
              <p>Gracias por completar la Evaluación de Viabilidad Técnica (TFA) para <strong>${data.companyName}</strong> - <strong>${data.workflowName}</strong>.</p>
              <p>Para garantizar la autenticidad de su envío e incluir sus respuestas en el análisis diagnóstico, verifique su dirección de correo electrónico haciendo clic en el botón a continuación:</p>
              
              <div class="button-container">
                <a href="${getVerificationUrl(data)}" class="button">Verificar Dirección de Correo</a>
              </div>

              <div class="info-box">
                <p style="margin: 0;"><strong>Importante:</strong> Sus respuestas no se incluirán en el informe diagnóstico final hasta que se verifique su correo electrónico. Este enlace de verificación caducará en 7 días.</p>
              </div>

              <p>Si no envió esta evaluación, ignore este correo electrónico.</p>
              <p>Si el botón de arriba no funciona, copie y pegue este enlace en su navegador:</p>
              <p style="word-break: break-all; color: #0f172a; font-size: 14px;">${getVerificationUrl(data)}</p>
            </div>
            <div class="footer">
              <p>Este es un mensaje automático de la Plataforma de Diagnóstico Athenia.</p>
              <p>Por favor, no responda a este correo electrónico.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: (data: VerificationEmailData) => `
Hola ${data.recipientName},

Gracias por completar la Evaluación de Viabilidad Técnica (TFA) para ${data.companyName} - ${data.workflowName}.

Para garantizar la autenticidad de su envío e incluir sus respuestas en el análisis diagnóstico, verifique su dirección de correo electrónico visitando el siguiente enlace:

${getVerificationUrl(data)}

IMPORTANTE: Sus respuestas no se incluirán en el informe diagnóstico final hasta que se verifique su correo electrónico. Este enlace de verificación caducará en 7 días.

Si no envió esta evaluación, ignore este correo electrónico.

---
Este es un mensaje automático de la Plataforma de Diagnóstico Athenia.
Por favor, no responda a este correo electrónico.
      `,
    },
    pif: {
      subject: (companyName: string) => `Verifique su Formulario de Perspectivas de Proceso - ${companyName}`,
      html: (data: VerificationEmailData) => `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body { font-family: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6; color: #1e293b; background-color: #f8fafc; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1); overflow: hidden; }
            .header { background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); color: #ffffff; padding: 32px 24px; text-align: center; }
            .header h1 { margin: 0; font-size: 24px; font-weight: 600; }
            .content { padding: 32px 24px; }
            .content p { margin: 0 0 16px 0; }
            .button-container { text-align: center; margin: 32px 0; }
            .button { display: inline-block; background-color: #0f172a; color: #ffffff; padding: 14px 32px; text-decoration: none; border-radius: 6px; font-weight: 500; }
            .button:hover { background-color: #334155; }
            .footer { background-color: #f1f5f9; padding: 24px; text-align: center; font-size: 14px; color: #64748b; border-top: 1px solid #e2e8f0; }
            .info-box { background-color: #f1f5f9; border-left: 4px solid #0f172a; padding: 16px; margin: 24px 0; border-radius: 4px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Verifique Su Envío de Evaluación</h1>
            </div>
            <div class="content">
              <p>Hola ${data.recipientName},</p>
              <p>Gracias por completar el Formulario de Perspectivas de Proceso (PIF) para <strong>${data.companyName}</strong> - <strong>${data.workflowName}</strong>.</p>
              <p>Para garantizar la autenticidad de su envío e incluir sus respuestas en el análisis diagnóstico, verifique su dirección de correo electrónico haciendo clic en el botón a continuación:</p>
              
              <div class="button-container">
                <a href="${getVerificationUrl(data)}" class="button">Verificar Dirección de Correo</a>
              </div>

              <div class="info-box">
                <p style="margin: 0;"><strong>Importante:</strong> Sus respuestas no se incluirán en el informe diagnóstico final hasta que se verifique su correo electrónico. Este enlace de verificación caducará en 7 días.</p>
              </div>

              <p>Si no envió esta evaluación, ignore este correo electrónico.</p>
              <p>Si el botón de arriba no funciona, copie y pegue este enlace en su navegador:</p>
              <p style="word-break: break-all; color: #0f172a; font-size: 14px;">${getVerificationUrl(data)}</p>
            </div>
            <div class="footer">
              <p>Este es un mensaje automático de la Plataforma de Diagnóstico Athenia.</p>
              <p>Por favor, no responda a este correo electrónico.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: (data: VerificationEmailData) => `
Hola ${data.recipientName},

Gracias por completar el Formulario de Perspectivas de Proceso (PIF) para ${data.companyName} - ${data.workflowName}.

Para garantizar la autenticidad de su envío e incluir sus respuestas en el análisis diagnóstico, verifique su dirección de correo electrónico visitando el siguiente enlace:

${getVerificationUrl(data)}

IMPORTANTE: Sus respuestas no se incluirán en el informe diagnóstico final hasta que se verifique su correo electrónico. Este enlace de verificación caducará en 7 días.

Si no envió esta evaluación, ignore este correo electrónico.

---
Este es un mensaje automático de la Plataforma de Diagnóstico Athenia.
Por favor, no responda a este correo electrónico.
      `,
    },
  },
};

/**
 * Generate verification URL based on form type and token
 */
function getVerificationUrl(data: VerificationEmailData): string {
  const baseUrl = process.env.REPLIT_DEV_DOMAIN
    ? `https://${process.env.REPLIT_DEV_DOMAIN}`
    : process.env.BASE_URL || 'http://localhost:5000';
  
  return `${baseUrl}/api/${data.formType}/verify/${data.verificationToken}`;
}

/**
 * Send verification email
 */
export async function sendVerificationEmail(data: VerificationEmailData): Promise<{ success: boolean; error?: string }> {
  const transporter = createTransporter();
  
  if (!transporter) {
    console.warn(`[Email Service] Skipping verification email for ${data.recipientEmail} - SMTP not configured`);
    console.log(`[Email Service] Verification URL: ${getVerificationUrl(data)}`);
    return {
      success: false,
      error: 'SMTP not configured. Email not sent.',
    };
  }

  try {
    const config = getEmailConfig();
    const template = emailTemplates[data.language][data.formType];
    
    const mailOptions = {
      from: config.from,
      to: data.recipientEmail,
      subject: template.subject(data.companyName),
      html: template.html(data),
      text: template.text(data),
    };

    await transporter.sendMail(mailOptions);
    console.log(`[Email Service] Verification email sent successfully to ${data.recipientEmail}`);
    
    return { success: true };
  } catch (error) {
    console.error('[Email Service] Failed to send verification email:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Generate a secure random verification token
 */
export function generateVerificationToken(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const tokenLength = 32;
  let token = '';
  
  for (let i = 0; i < tokenLength; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return token;
}
