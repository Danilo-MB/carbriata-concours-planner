import { Injectable } from '@nestjs/common';
import * as dns from 'dns/promises';
import { Resend } from 'resend';

@Injectable()
export class MailService {
  private resend: Resend | null = null;

  constructor() {
    const apiKey = process.env.RESEND_API_KEY;
    if (apiKey) {
      this.resend = new Resend(apiKey);
    }
  }

  /**
   * Validates syntax, blocks disposable temporary emails, and checks DNS MX records.
   */
  async validateEmail(email: string): Promise<{ valid: boolean; reason?: string }> {
    const clean = email.toLowerCase().trim();
    const parts = clean.split('@');
    if (parts.length !== 2 || !parts[0] || !parts[1]) {
      return { valid: false, reason: 'Formato de correo electrónico no válido.' };
    }

    const domain = parts[1];

    // Disposable/temporary email domains list
    const disposableDomains = new Set([
      'mailinator.com',
      '10minutemail.com',
      'tempmail.com',
      'temp-mail.org',
      'guerrillamail.com',
      'sharklasers.com',
      'throwawaymail.com',
      'yopmail.com',
      'trashmail.com',
      'getairmail.com',
      'dispostable.com',
      'fakeinbox.com',
      'tempinbox.com'
    ]);

    if (disposableDomains.has(domain)) {
      return { valid: false, reason: 'No se permiten correos temporales o desechables.' };
    }

    // Check DNS MX records
    try {
      const records = await dns.resolveMx(domain);
      if (!records || records.length === 0) {
        return { valid: false, reason: `El dominio @${domain} no tiene servidores de correo configurados.` };
      }
      return { valid: true };
    } catch {
      return { valid: false, reason: `El dominio @${domain} no existe o no puede recibir correos.` };
    }
  }

  /**
   * Sends 6-digit OTP activation code via Resend.
   */
  async sendVerificationCode(email: string, code: string, name?: string): Promise<{ success: boolean; id?: string }> {
    const cleanEmail = email.toLowerCase().trim();
    const displayName = name?.trim() || cleanEmail.split('@')[0];

    // Check if Resend client is initialized
    if (!this.resend) {
      const apiKey = process.env.RESEND_API_KEY;
      if (apiKey) {
        this.resend = new Resend(apiKey);
      }
    }

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Código de verificación MapFlex</title>
        </head>
        <body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
          <table width="100%" border="0" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; padding: 40px 16px;">
            <tr>
              <td align="center">
                <table width="100%" border="0" cellpadding="0" cellspacing="0" style="max-width: 500px; background-color: #ffffff; border-radius: 20px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 16px rgba(0,0,0,0.05);">
                  <!-- Header -->
                  <tr>
                    <td style="padding: 32px 32px 16px 32px; text-align: left;">
                      <div style="display: inline-flex; align-items: center; gap: 8px;">
                        <span style="font-size: 22px; font-weight: 800; color: #0f172a; letter-spacing: -0.5px;">Map<span style="color: #ea580c;">Flex</span></span>
                      </div>
                    </td>
                  </tr>

                  <!-- Content -->
                  <tr>
                    <td style="padding: 0 32px 24px 32px; text-align: left;">
                      <h1 style="margin: 0 0 12px 0; font-size: 20px; font-weight: 700; color: #0f172a;">Verifica tu correo electrónico</h1>
                      <p style="margin: 0 0 24px 0; font-size: 14px; line-height: 1.6; color: #475569;">
                        Hola <strong>${displayName}</strong>, usa el siguiente código de 6 dígitos para activar tu cuenta y comenzar a guardar tus mapas en MapFlex:
                      </p>

                      <!-- Code Box -->
                      <div style="background-color: #f1f5f9; border: 2px dashed #cbd5e1; border-radius: 14px; padding: 18px 24px; text-align: center; margin: 24px 0;">
                        <span style="font-family: ui-monospace, Menlo, Consolas, monospace; font-size: 32px; font-weight: 800; letter-spacing: 8px; color: #0f172a;">${code}</span>
                      </div>

                      <p style="margin: 0; font-size: 12px; line-height: 1.5; color: #94a3b8;">
                        ⏱️ Este código expira en <strong>15 minutos</strong>. Si no creaste una cuenta en MapFlex, puedes ignorar este mensaje con seguridad.
                      </p>
                    </td>
                  </tr>

                  <!-- Footer -->
                  <tr>
                    <td style="padding: 24px 32px; background-color: #f8fafc; border-top: 1px solid #f1f5f9; text-align: center;">
                      <p style="margin: 0; font-size: 11px; color: #94a3b8;">
                        MapFlex &bull; Plataforma de mapas y planificación interactiva.
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `;

    if (!this.resend) {
      console.log(`[SIMULATED EMAIL] To: ${cleanEmail} | OTP Code: ${code}`);
      return { success: true, id: 'simulated' };
    }

    try {
      const fromEmail = process.env.RESEND_FROM_EMAIL || 'MapFlex <no-reply@mapflex.app>';
      const data = await this.resend.emails.send({
        from: fromEmail,
        to: cleanEmail,
        subject: `${code} es tu código de verificación de MapFlex`,
        html
      });
      return { success: true, id: data.data?.id };
    } catch (err: any) {
      console.warn('Failed with primary sender, trying onboarding@resend.dev fallback:', err?.message);
      try {
        const fallback = await this.resend.emails.send({
          from: 'MapFlex <onboarding@resend.dev>',
          to: cleanEmail,
          subject: `${code} es tu código de verificación de MapFlex`,
          html
        });
        return { success: true, id: fallback.data?.id };
      } catch (fallbackErr: any) {
        console.error('Resend delivery error:', fallbackErr);
        // Fallback to avoid completely blocking if key isn't active
        return { success: false };
      }
    }
  }
}
