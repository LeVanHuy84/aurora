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
    const smtpPass = rawPass ? rawPass.trim() : undefined;
    const portVal = this.configService.get<string | number>('SMTP_PORT', 587);
    const smtpPort = typeof portVal === 'string' ? parseInt(portVal, 10) : portVal;
    const smtpSecure = smtpPort === 465;

    if (!smtpHost || !smtpUser) {
      return null;
    }

    if (!this.transporter) {
      const transportOptions: nodemailer.TransportOptions = {
        host: smtpHost,
        port: smtpPort,
        secure: smtpSecure,
        auth: {
          user: smtpUser,
          pass: smtpPass?.replace(/\s+/g, ''),
        },
        connectionTimeout: 6000,
        greetingTimeout: 6000,
        socketTimeout: 6000,
        tls: {
          rejectUnauthorized: false,
        },
      } as any;

      if (smtpHost === 'smtp.gmail.com' || smtpHost === 'gmail') {
        this.transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: smtpUser,
            pass: smtpPass?.replace(/\s+/g, ''),
          },
          connectionTimeout: 6000,
          greetingTimeout: 6000,
          socketTimeout: 6000,
        });
        this.logger.log(`SMTP transporter initialized with Gmail service (${smtpUser})`);
      } else {
        this.transporter = nodemailer.createTransport(transportOptions);
        this.logger.log(`SMTP transporter initialized successfully (${smtpHost}:${smtpPort})`);
      }
    }

    return this.transporter;
  }

  private getResendClient(): Resend | null {
    const resendApiKey = this.configService.get<string>('RESEND_API_KEY');
    if (resendApiKey && !this.resend) {
      this.resend = new Resend(resendApiKey);
      this.logger.log('Resend email client initialized successfully (HTTP REST API)');
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
    const resendApiKey = this.configService.get<string>('RESEND_API_KEY');

    // Default sender determination
    const configuredFrom = this.configService.get<string>('MAIL_FROM');
    let fromAddress = configuredFrom;

    if (!fromAddress) {
      if (resendApiKey) {
        fromAddress = 'Aurora <onboarding@resend.dev>';
      } else if (smtpUser) {
        fromAddress = `Aurora <${smtpUser}>`;
      } else {
        fromAddress = 'Aurora <onboarding@resend.dev>';
      }
    }

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

    const resend = this.getResendClient();
    const transporter = this.getTransporter();

    // 1. Try Resend HTTP REST API First (bypasses Render/Cloud outbound SMTP port blocks)
    if (resend) {
      try {
        const { data, error } = await resend.emails.send({
          from: fromAddress,
          to: [email],
          subject,
          html,
        });

        if (error) {
          this.logger.warn(`Resend failed for ${email}: ${JSON.stringify(error)}. Trying SMTP fallback if available...`);
        } else {
          this.logger.log(`Verification OTP email dispatched via Resend to ${email} (ID: ${data?.id})`);
          return true;
        }
      } catch (err: any) {
        this.logger.warn(`Resend exception for ${email}: ${err?.message || err}. Trying SMTP fallback...`);
      }
    }

    // 2. Try Nodemailer / SMTP
    if (transporter) {
      try {
        await transporter.sendMail({
          from: configuredFrom || (smtpUser ? `Aurora <${smtpUser}>` : fromAddress),
          to: email,
          subject,
          html,
        });
        this.logger.log(`Verification OTP email dispatched via SMTP to ${email}`);
        return true;
      } catch (err: any) {
        this.logger.error(
          `SMTP delivery failed for ${email}: ${err?.message || err} (Note: Cloud PaaS like Render block SMTP ports 587/465. Use RESEND_API_KEY instead)`,
        );
      }
    }

    // 3. Fallback / Dev Log: Print OTP prominently in logs so developers/testers can always retrieve it
    this.logger.warn(
      `\n======================================================\n📧 [OTP VERIFICATION LOG] To: ${email}\n🔑 Verification Code: ${otp}\n⏰ Expires in: 10 minutes\nℹ️  If email was not delivered, check RESEND_API_KEY or Render logs.\n======================================================\n`,
    );

    return false;
  }
}
