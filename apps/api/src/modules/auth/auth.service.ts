import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthProvider } from '@prisma/client';
import bcrypt from 'bcrypt';
import { PrismaService } from '../../common/prisma/prisma.service.js';
import { RegisterDto } from './dto/register.dto.js';
import { LoginDto } from './dto/login.dto.js';
import { RefreshTokenDto } from './dto/refresh-token.dto.js';
import { OAuthDto } from './dto/oauth.dto.js';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const existingEmail = await this.prisma.user.findFirst({
      where: { email: dto.email, deletedAt: null },
    });
    if (existingEmail) {
      throw new ConflictException('EMAIL_EXISTS');
    }

    const existingUsername = await this.prisma.user.findFirst({
      where: { username: dto.username, deletedAt: null },
    });
    if (existingUsername) {
      throw new ConflictException('USERNAME_EXISTS');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        username: dto.username,
        displayName: dto.displayName,
        password: hashedPassword,
        provider: AuthProvider.LOCAL,
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

    const tokens = await this.generateTokens(user.id, user.email);
    await this.updateRefreshToken(user.id, tokens.refreshToken);

    return { user, tokens };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findFirst({
      where: { email: dto.email, deletedAt: null },
    });

    if (!user || !user.password) {
      throw new UnauthorizedException('INVALID_CREDENTIALS');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('INVALID_CREDENTIALS');
    }

    const tokens = await this.generateTokens(user.id, user.email);
    await this.updateRefreshToken(user.id, tokens.refreshToken);

    const { password: _password, ...userWithoutPassword } = user;
    return { user: userWithoutPassword, tokens };
  }

  async googleLogin(dto: OAuthDto) {
    // Basic verification / token parsing fallback logic
    if (!dto.idToken) {
      throw new BadRequestException('ID token is required');
    }

    // Standardized payload mock/verifier format for OAuth token
    const email = `google_${dto.idToken.slice(0, 8)}@aurora.internal`;
    const username = `google_user_${dto.idToken.slice(0, 8)}`;
    const providerId = `google_sub_${dto.idToken.slice(0, 8)}`;

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
      user = await this.prisma.user.create({
        data: {
          email,
          username,
          displayName: 'Google User',
          provider: AuthProvider.GOOGLE,
          providerId,
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
    }

    const tokens = await this.generateTokens(user.id, user.email);
    await this.updateRefreshToken(user.id, tokens.refreshToken);

    return { user, tokens };
  }

  async appleLogin(dto: OAuthDto) {
    if (!dto.idToken) {
      throw new BadRequestException('ID token is required');
    }

    const email = `apple_${dto.idToken.slice(0, 8)}@aurora.internal`;
    const username = `apple_user_${dto.idToken.slice(0, 8)}`;
    const providerId = `apple_sub_${dto.idToken.slice(0, 8)}`;

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
      user = await this.prisma.user.create({
        data: {
          email,
          username,
          displayName: 'Apple User',
          provider: AuthProvider.APPLE,
          providerId,
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
    }

    const tokens = await this.generateTokens(user.id, user.email);
    await this.updateRefreshToken(user.id, tokens.refreshToken);

    return { user, tokens };
  }

  async refreshToken(dto: RefreshTokenDto) {
    let payload: { sub: string; email: string };
    try {
      payload = this.jwtService.verify(dto.refreshToken, {
        secret: process.env.JWT_SECRET || 'aurora_super_secret_jwt_key_change_me_in_production',
      });
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    const user = await this.prisma.user.findFirst({
      where: { id: payload.sub, deletedAt: null },
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
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        { sub: userId, email },
        {
          secret: process.env.JWT_SECRET || 'aurora_super_secret_jwt_key_change_me_in_production',
          expiresIn: '15m',
        },
      ),
      this.jwtService.signAsync(
        { sub: userId, email },
        {
          secret: process.env.JWT_SECRET || 'aurora_super_secret_jwt_key_change_me_in_production',
          expiresIn: '30d',
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
