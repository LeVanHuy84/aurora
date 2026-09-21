import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthProvider } from '@prisma/client';
import bcrypt from 'bcrypt';
import { PrismaService } from '../../common/prisma/prisma.service.js';
import { MailService } from '../mail/mail.service.js';
import { ConfigService } from '@nestjs/config';
import { RegisterDto } from './dto/register.dto.js';
import { LoginDto } from './dto/login.dto.js';
import { RefreshTokenDto } from './dto/refresh-token.dto.js';
import { OAuthDto } from './dto/oauth.dto.js';
import { VerifyOtpDto } from './dto/verify-otp.dto.js';
import { ResendOtpDto } from './dto/resend-otp.dto.js';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
    private readonly configService: ConfigService,
  ) {}

  private generateOtp(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  async register(dto: RegisterDto) {
    const cleanEmail = dto.email.trim().toLowerCase();
    const cleanUsername = dto.username.trim().toLowerCase();

    const existingEmail = await this.prisma.user.findFirst({
      where: { email: cleanEmail, deletedAt: null },
    });
    if (existingEmail) {
      throw new ConflictException('EMAIL_EXISTS');
    }

    const existingUsername = await this.prisma.user.findFirst({
      where: { username: cleanUsername, deletedAt: null },
    });
    if (existingUsername) {
      throw new ConflictException('USERNAME_EXISTS');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        email: cleanEmail,
        username: cleanUsername,
        displayName: dto.displayName.trim(),
        password: hashedPassword,
        provider: AuthProvider.LOCAL,
        isEmailVerified: false,
      },
      select: {
        id: true,
        email: true,
        username: true,
        displayName: true,
        avatarUrl: true,
        bio: true,
        provider: true,
        isEmailVerified: true,
        createdAt: true,
      },
    });

    // Generate and save 6-digit OTP
    const otp = this.generateOtp();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await this.prisma.emailOtp.deleteMany({ where: { email: cleanEmail } });
    await this.prisma.emailOtp.create({
      data: {
        email: cleanEmail,
        otp,
        expiresAt,
      },
    });

    // Dispatch verification email asynchronously
    this.mailService.sendVerificationOtp(cleanEmail, otp, user.displayName).catch(() => {});

    return {
      requiresEmailVerification: true,
      email: user.email,
      message: 'OTP_SENT',
    };
  }

  async verifyOtp(dto: VerifyOtpDto) {
    const cleanEmail = dto.email.trim().toLowerCase();
    const cleanOtp = dto.otp.trim();

    const user = await this.prisma.user.findFirst({
      where: { email: cleanEmail, deletedAt: null },
      select: {
        id: true,
        email: true,
        username: true,
        displayName: true,
        avatarUrl: true,
        bio: true,
        provider: true,
        isEmailVerified: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException('USER_NOT_FOUND');
    }

    const otpRecord = await this.prisma.emailOtp.findFirst({
      where: { email: cleanEmail, otp: cleanOtp },
      orderBy: { createdAt: 'desc' },
    });

    if (!otpRecord) {
      throw new BadRequestException('INVALID_OTP');
    }

    if (new Date() > otpRecord.expiresAt) {
      throw new BadRequestException('OTP_EXPIRED');
    }

    // Mark email as verified & delete OTP records
    await this.prisma.user.update({
      where: { id: user.id },
      data: { isEmailVerified: true },
    });

    await this.prisma.emailOtp.deleteMany({
      where: { email: cleanEmail },
    });

    const tokens = await this.generateTokens(user.id, user.email);
    await this.updateRefreshToken(user.id, tokens.refreshToken);

    return {
      user: { ...user, isEmailVerified: true },
      tokens,
    };
  }

  async resendOtp(dto: ResendOtpDto) {
    const cleanEmail = dto.email.trim().toLowerCase();

    const user = await this.prisma.user.findFirst({
      where: { email: cleanEmail, deletedAt: null },
    });

    if (!user) {
      throw new NotFoundException('USER_NOT_FOUND');
    }

    if (user.isEmailVerified) {
      throw new BadRequestException('EMAIL_ALREADY_VERIFIED');
    }

    // Check rate limit: cooldown 60 seconds
    const recentOtp = await this.prisma.emailOtp.findFirst({
      where: { email: cleanEmail },
      orderBy: { createdAt: 'desc' },
    });

    if (recentOtp) {
      const elapsed = Date.now() - recentOtp.createdAt.getTime();
      if (elapsed < 60 * 1000) {
        const remainingSeconds = Math.ceil((60 * 1000 - elapsed) / 1000);
        throw new BadRequestException(`RESEND_COOLDOWN_${remainingSeconds}S`);
      }
    }

    const otp = this.generateOtp();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await this.prisma.emailOtp.deleteMany({ where: { email: cleanEmail } });
    await this.prisma.emailOtp.create({
      data: {
        email: cleanEmail,
        otp,
        expiresAt,
      },
    });

    await this.mailService.sendVerificationOtp(cleanEmail, otp, user.displayName);

    return { success: true, message: 'OTP_RESENT' };
  }

  async login(dto: LoginDto) {
    const cleanEmail = dto.email.trim().toLowerCase();
    const user = await this.prisma.user.findFirst({
      where: { email: cleanEmail, deletedAt: null },
    });

    if (!user || !user.password) {
      throw new UnauthorizedException('INVALID_CREDENTIALS');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('INVALID_CREDENTIALS');
    }

    // If local user has not verified email, send OTP if none active and require verification
    if (!user.isEmailVerified && user.provider === AuthProvider.LOCAL) {
      const activeOtp = await this.prisma.emailOtp.findFirst({
        where: { email: cleanEmail, expiresAt: { gt: new Date() } },
      });

      if (!activeOtp) {
        const otp = this.generateOtp();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
        await this.prisma.emailOtp.deleteMany({ where: { email: cleanEmail } });
        await this.prisma.emailOtp.create({
          data: {
            email: cleanEmail,
            otp,
            expiresAt,
          },
        });
        this.mailService.sendVerificationOtp(cleanEmail, otp, user.displayName).catch(() => {});
      }

      return {
        requiresEmailVerification: true,
        email: user.email,
        message: 'EMAIL_NOT_VERIFIED',
      };
    }

    const tokens = await this.generateTokens(user.id, user.email);
    await this.updateRefreshToken(user.id, tokens.refreshToken);

    const { password: _password, ...userWithoutPassword } = user;
    return { user: userWithoutPassword, tokens };
  }

  private async verifyGoogleToken(token: string) {
    // 1. Try Google TokenInfo endpoint (accepts both id_token and access_token)
    try {
      const response = await fetch(
        `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(token)}`,
      );
      if (response.ok) {
        const data = await response.json();
        if (data.email) {
          return {
            providerId: data.sub || data.user_id,
            email: data.email.toLowerCase(),
            displayName: data.name || data.given_name || data.email.split('@')[0],
            avatarUrl: data.picture || null,
          };
        }
      }
    } catch {
      // ignore and try next
    }

    // 2. Try Google UserInfo endpoint
    try {
      const userinfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (userinfoRes.ok) {
        const data = await userinfoRes.json();
        if (data.email) {
          return {
            providerId: data.sub,
            email: data.email.toLowerCase(),
            displayName: data.name || data.given_name || data.email.split('@')[0],
            avatarUrl: data.picture || null,
          };
        }
      }
    } catch {
      // ignore
    }

    throw new UnauthorizedException('INVALID_GOOGLE_TOKEN');
  }

  private verifyAppleToken(identityToken: string) {
    try {
      const parts = identityToken.split('.');
      if (parts.length < 2) {
        throw new Error('Invalid JWT format');
      }
      const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf8'));
      if (!payload.sub) {
        throw new Error('Missing sub in Apple identity token');
      }
      return {
        providerId: payload.sub,
        email: payload.email
          ? payload.email.toLowerCase()
          : `apple_${payload.sub.slice(0, 10)}@privaterelay.appleid.com`,
        displayName: 'Apple User',
      };
    } catch {
      throw new UnauthorizedException('INVALID_APPLE_TOKEN');
    }
  }

  async googleLogin(dto: OAuthDto) {
    if (!dto.idToken) {
      throw new BadRequestException('ID token is required');
    }

    const { providerId, email, displayName, avatarUrl } = await this.verifyGoogleToken(dto.idToken);

    let user = await this.prisma.user.findFirst({
      where: {
        OR: [{ providerId }, { email }],
        deletedAt: null,
      },
      select: {
        id: true,
        email: true,
        username: true,
        displayName: true,
        avatarUrl: true,
        bio: true,
        provider: true,
        createdAt: true,
      },
    });

    if (!user) {
      const baseUsername = (email.split('@')[0] || displayName)
        .toLowerCase()
        .replace(/[^a-z0-9_]/g, '_')
        .slice(0, 20);
      const uniqueSuffix = Math.floor(1000 + Math.random() * 9000);
      const username = `${baseUsername}_${uniqueSuffix}`;

      user = await this.prisma.user.create({
        data: {
          email,
          username,
          displayName,
          avatarUrl,
          provider: AuthProvider.GOOGLE,
          providerId,
          isEmailVerified: true,
        },
        select: {
          id: true,
          email: true,
          username: true,
          displayName: true,
          avatarUrl: true,
          bio: true,
          provider: true,
          isEmailVerified: true,
          createdAt: true,
        },
      });
    } else {
      await this.prisma.user.update({
        where: { id: user.id },
        data: {
          providerId,
          isEmailVerified: true,
          ...(avatarUrl && !user.avatarUrl ? { avatarUrl } : {}),
        },
      });
    }

    const tokens = await this.generateTokens(user.id, user.email);
    await this.updateRefreshToken(user.id, tokens.refreshToken);

    return { user, tokens };
  }

  async appleLogin(dto: OAuthDto) {
    if (!dto.idToken) {
      throw new BadRequestException('ID token is required');
    }

    const { providerId, email, displayName } = this.verifyAppleToken(dto.idToken);

    let user = await this.prisma.user.findFirst({
      where: {
        OR: [{ providerId }, { email }],
        deletedAt: null,
      },
      select: {
        id: true,
        email: true,
        username: true,
        displayName: true,
        avatarUrl: true,
        bio: true,
        provider: true,
        isEmailVerified: true,
        createdAt: true,
      },
    });

    if (!user) {
      const baseUsername = (email.split('@')[0] || displayName)
        .toLowerCase()
        .replace(/[^a-z0-9_]/g, '_')
        .slice(0, 20);
      const uniqueSuffix = Math.floor(1000 + Math.random() * 9000);
      const username = `${baseUsername}_${uniqueSuffix}`;

      user = await this.prisma.user.create({
        data: {
          email,
          username,
          displayName,
          provider: AuthProvider.APPLE,
          providerId,
          isEmailVerified: true,
        },
        select: {
          id: true,
          email: true,
          username: true,
          displayName: true,
          avatarUrl: true,
          bio: true,
          provider: true,
          isEmailVerified: true,
          createdAt: true,
        },
      });
    } else {
      await this.prisma.user.update({
        where: { id: user.id },
        data: {
          providerId,
          isEmailVerified: true,
        },
      });
    }

    const tokens = await this.generateTokens(user.id, user.email);
    await this.updateRefreshToken(user.id, tokens.refreshToken);

    return { user, tokens };
  }

  async refreshToken(dto: RefreshTokenDto) {
    let payload: { sub?: string; userId?: string; email: string };
    const jwtSecret =
      this.configService.get<string>('JWT_SECRET') ||
      'aurora_super_secret_jwt_key_change_me_in_production';
    try {
      payload = this.jwtService.verify(dto.refreshToken, {
        secret: jwtSecret,
      });
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    const userId = payload.userId || payload.sub;
    if (!userId) {
      throw new UnauthorizedException('Invalid token payload');
    }

    const user = await this.prisma.user.findFirst({
      where: { id: userId, deletedAt: null },
    });

    if (!user) {
      throw new UnauthorizedException('Access denied');
    }

    const savedTokens = await this.prisma.refreshToken.findMany({
      where: { userId: user.id },
    });

    let matchedTokenRecord = null;
    for (const record of savedTokens) {
      const isMatch = await bcrypt.compare(dto.refreshToken, record.token);
      if (isMatch) {
        matchedTokenRecord = record;
        break;
      }
    }

    if (!matchedTokenRecord || new Date() > matchedTokenRecord.expiresAt) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    // Invalidate old token record
    await this.prisma.refreshToken.delete({
      where: { id: matchedTokenRecord.id },
    });

    const tokens = await this.generateTokens(user.id, user.email);
    await this.updateRefreshToken(user.id, tokens.refreshToken);

    return tokens;
  }

  async logout(userId: string) {
    await this.prisma.refreshToken.deleteMany({
      where: { userId },
    });
    return { success: true };
  }

  private async generateTokens(userId: string, email: string) {
    const jwtSecret =
      this.configService.get<string>('JWT_SECRET') ||
      'aurora_super_secret_jwt_key_change_me_in_production';
    const accessExpiresIn = (this.configService.get<string>('JWT_EXPIRATION') || '15m') as any;
    const refreshExpiresIn = (this.configService.get<string>('JWT_REFRESH_EXPIRATION') || '30d') as any;

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        { sub: userId, userId, email },
        {
          secret: jwtSecret,
          expiresIn: accessExpiresIn,
        },
      ),
      this.jwtService.signAsync(
        { sub: userId, userId, email },
        {
          secret: jwtSecret,
          expiresIn: refreshExpiresIn,
        },
      ),
    ]);

    return { accessToken, refreshToken };
  }

  private async updateRefreshToken(userId: string, refreshToken: string) {
    const hashedToken = await bcrypt.hash(refreshToken, 10);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    await this.prisma.refreshToken.create({
      data: {
        userId,
        token: hashedToken,
        expiresAt,
      },
    });
  }
}
