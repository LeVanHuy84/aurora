import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';
import * as nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private resend: Resend | null = null;
  private transporter: Transporter | null = null;

  constructor(private readonly configService: ConfigService) {}

  private getTransporter(): Transporter | null {
    const smtpHost = this.configService.get<string>('SMTP_HOST');
    const smtpUser = this.configService.get<string>('SMTP_USER');
    const rawPass = this.configService.get<string>('SMTP_PASS');
    // Keep clean password (handle both with or without spaces for Google App Passwords)
    const smtpPass = rawPass ? rawPass.trim() : undefined;
    const portVal = this.configService.get<string | number>('SMTP_PORT', 587);
    const smtpPort = typeof portVal === 'string' ? parseInt(portVal, 10) : portVal;
    const smtpSecure = smtpPort === 465;

    if (!smtpHost || !smtpUser) {
      return null;
    }

    if (!this.transporter) {
      if (smtpHost === 'smtp.gmail.com' || smtpHost === 'gmail') {
        this.transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: smtpUser,
            pass: smtpPass?.replace(/\s+/g, ''),
          },
        });
        this.logger.log(`SMTP transporter initialized with Gmail service (${smtpUser})`);
      } else {
        this.transporter = nodemailer.createTransport({
          host: smtpHost,
          port: smtpPort,
          secure: smtpSecure,
          auth: {
            user: smtpUser,
            pass: smtpPass,
          },
          tls: {
            rejectUnauthorized: false,
          },
        });
        this.logger.log(`SMTP transporter initialized successfully (${smtpHost}:${smtpPort})`);
      }
    }

    return this.transporter;
  }

  private getResendClient(): Resend | null {
    const resendApiKey = this.configService.get<string>('RESEND_API_KEY');
    if (resendApiKey && !this.resend) {
      this.resend = new Resend(resendApiKey);
      this.logger.log('Resend email client initialized successfully');
    }
    return this.resend;
  }

  async sendVerificationOtp(
    email: string,
    otp: string,
    displayName?: string,
  ): Promise<boolean> {
    const recipientName = displayName || email.split('@')[0];
    const smtpUser = this.configService.get<string>('SMTP_USER');
    const defaultFrom = smtpUser ? `Aurora <${smtpUser}>` : 'Aurora <no-reply@aurora.app>';
    const fromAddress = this.configService.get<string>('MAIL_FROM') || defaultFrom;

    const html = `
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Mã xác thực Aurora</title>
</head>
<body style="margin: 0; padding: 32px 16px; background-color: #FDFBF7; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; color: #2C2C2C;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="table-layout: fixed;">
    <tr>
      <td align="center">
        <!-- Main Card -->
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 500px; background-color: #FFFFFF; border-radius: 24px; border: 1px solid #F0ECE4; overflow: hidden; box-shadow: 0 8px 24px rgba(0, 0, 0, 0.04);">
          <!-- Top Gradient Accent Bar -->
          <tr>
            <td height="6" style="background: linear-gradient(90deg, #E76F51 0%, #F4A261 50%, #2A9D8F 100%);"></td>
          </tr>

          <!-- Content Padding Area -->
          <tr>
            <td style="padding: 40px 32px 32px; text-align: center;">
              <!-- Official Aurora Emblem SVG (Favicon Artwork) -->
              <div style="display: inline-block; margin-bottom: 16px;">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="68" height="68" style="display: block; border-radius: 18px; box-shadow: 0 6px 18px rgba(231, 111, 81, 0.2);">
                  <defs>
                    <linearGradient id="sky" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stop-color="#6F8FD9"/>
                      <stop offset="48%" stop-color="#AFA8E7"/>
                      <stop offset="78%" stop-color="#F1B9C7"/>
                      <stop offset="100%" stop-color="#F6D49A"/>
                    </linearGradient>
                    <radialGradient id="sunGlow" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stop-color="#FFF9E8" stop-opacity="0.95"/>
                      <stop offset="55%" stop-color="#FFEBC7" stop-opacity="0.35"/>
                      <stop offset="100%" stop-color="#FFEBC7" stop-opacity="0"/>
                    </radialGradient>
                    <linearGradient id="wave1" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stop-color="#718DD4"/>
                      <stop offset="55%" stop-color="#8299DF"/>
                      <stop offset="100%" stop-color="#A8A4E4"/>
                    </linearGradient>
                    <linearGradient id="wave2" x1="1" y1="0" x2="0" y2="1">
                      <stop offset="0%" stop-color="#C2B9EA"/>
                      <stop offset="100%" stop-color="#8198DC"/>
                    </linearGradient>
                    <filter id="blur" x="-50%" y="-50%" width="200%" height="200%">
                      <feGaussianBlur stdDeviation="14"/>
                    </filter>
                    <clipPath id="round">
                      <rect width="512" height="512" rx="116"/>
                    </clipPath>
                  </defs>
                  <g clip-path="url(#round)">
                    <rect width="512" height="512" fill="url(#sky)"/>
                    <path d="M-30 92 C80 42 126 88 186 156 C229 205 292 204 350 166 C401 133 463 132 542 178 L542 -20 L-30 -20Z" fill="#D9D4F2" opacity="0.18"/>
                    <path d="M-40 330 C67 274 131 290 206 318 C285 348 339 322 420 274 C466 247 510 250 548 271 L548 390 L-40 390Z" fill="#FFD9D6" opacity="0.12"/>
                    <circle cx="352" cy="350" r="116" fill="url(#sunGlow)" filter="url(#blur)"/>
                    <circle cx="352" cy="350" r="58" fill="#FFF8E5" opacity="0.98"/>
                    <path d="M-20 374 C62 338 116 346 180 366 C247 387 293 378 348 357 C410 333 462 337 532 364 L532 532 L-20 532Z" fill="#B4B7E8" opacity="0.72"/>
                    <path d="M-25 395 C70 351 138 374 209 405 C284 438 348 440 421 405 C467 383 505 381 540 392 L540 540 L-25 540Z" fill="url(#wave1)"/>
                    <path d="M-25 459 C66 424 128 425 202 451 C280 478 340 492 421 462 C474 443 511 443 540 452 L540 540 L-25 540Z" fill="url(#wave2)" opacity="0.92"/>
                    <path d="M-10 447 C94 420 166 444 244 475 C321 506 401 503 522 439" fill="none" stroke="#F8DCCF" stroke-width="3" opacity="0.72"/>
                    <path d="M427 137 L433 153 L449 159 L433 165 L427 181 L421 165 L405 159 L421 153Z" fill="#FFF8E7" opacity="0.95"/>
                    <circle cx="112" cy="176" r="3.5" fill="#FFF6E4" opacity="0.8"/>
                    <circle cx="452" cy="245" r="3" fill="#FFF6E4" opacity="0.72"/>
                  </g>
                </svg>
              </div>

              <!-- Header Titles -->
              <h1 style="font-size: 24px; font-weight: 800; color: #2C2C2C; margin: 0 0 4px; letter-spacing: -0.3px;">Aurora</h1>
              <p style="font-size: 13.5px; font-weight: 600; color: #E76F51; margin: 0 0 24px; letter-spacing: 0.2px;">Một góc nhỏ cho ngày của bạn</p>

              <div style="text-align: left; background-color: #FAF6EE; border-radius: 16px; padding: 18px 20px; margin-bottom: 24px; border: 1px solid #F0ECE4;">
                <p style="font-size: 15px; color: #2C2C2C; margin: 0 0 6px; line-height: 1.5;">
                  Xin chào <strong>${recipientName}</strong> 👋,
                </p>
                <p style="font-size: 14px; color: #757575; margin: 0; line-height: 1.5;">
                  Chào mừng bạn bắt đầu cuốn nhật ký thường ngày cùng những người thân yêu. Hãy nhập mã xác thực dưới đây vào ứng dụng để kích hoạt tài khoản:
                </p>
              </div>

              <!-- OTP Verification Box -->
              <div style="background-color: #FFF9F2; border: 1.5px dashed #F4A261; border-radius: 20px; padding: 22px 20px; margin: 24px 0;">
                <div style="font-size: 38px; font-weight: 800; letter-spacing: 12px; color: #E76F51; font-family: ui-monospace, Menlo, Monaco, 'Courier New', monospace; margin: 0 0 4px; padding-left: 12px;">${otp}</div>
                <div style="font-size: 12.5px; color: #A0A0A0; font-weight: 500;">⏱️ Mã xác thực có hiệu lực trong vòng <strong>10 phút</strong></div>
              </div>

              <!-- Security Notice -->
              <div style="text-align: left; padding: 14px 16px; background-color: #FFFFFF; border-left: 3px solid #2A9D8F; border-radius: 0 12px 12px 0; margin-bottom: 20px;">
                <p style="font-size: 12.5px; color: #757575; margin: 0; line-height: 1.5;">
                  🔒 <strong>Bảo mật:</strong> Tuyệt đối không chia sẻ mã này cho bất kỳ ai. Nếu bạn không tạo tài khoản Aurora, vui lòng bỏ qua email này.
                </p>
              </div>

              <!-- Footer Note -->
              <div style="border-top: 1px solid #F0ECE4; padding-top: 20px; margin-top: 24px;">
                <p style="font-size: 12px; color: #A0A0A0; margin: 0; line-height: 1.6;">
                  © ${new Date().getFullYear()} Aurora App. Ghi lại, chiêm nghiệm và sẻ chia khoảnh khắc chân thật.
                </p>
              </div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `.trim();

    const subject = `[Aurora] ${otp} là mã xác thực tài khoản của bạn`;

    const transporter = this.getTransporter();
    const resend = this.getResendClient();

    if (transporter) {
      try {
        await transporter.sendMail({
          from: fromAddress,
          to: email,
          subject,
          html,
        });
        this.logger.log(`Verification OTP email dispatched via SMTP to ${email}`);
        return true;
      } catch (err: any) {
        this.logger.error(
          `Exception sending email via SMTP to ${email}: ${err?.message || err}`,
          err?.stack,
        );
        this.logger.log(`[FALLBACK DEV OTP] Email: ${email} | Code: ${otp}`);
        return false;
      }
    } else if (resend) {
      try {
        const { error } = await resend.emails.send({
          from: fromAddress,
          to: [email],
          subject,
          html,
        });

        if (error) {
          this.logger.error(`Failed to send verification email to ${email}:`, error);
          this.logger.log(`[FALLBACK DEV OTP] Email: ${email} | Code: ${otp}`);
          return false;
        }

        this.logger.log(`Verification OTP email dispatched via Resend to ${email}`);
        return true;
      } catch (err: any) {
        this.logger.error(`Exception sending email via Resend to ${email}:`, err);
        this.logger.log(`[FALLBACK DEV OTP] Email: ${email} | Code: ${otp}`);
        return false;
      }
    } else {
      this.logger.log(
        `\n======================================================\n📧 [DEV OTP EMAIL] To: ${email}\n🔑 Verification Code: ${otp}\n⏰ Expires in: 10 minutes\n======================================================\n`,
      );
      return true;
    }
  }
}
