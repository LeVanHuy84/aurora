import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service.js';
import { UpdateUserDto } from './dto/update-user.dto.js';
import { UpdateFcmTokenDto } from './dto/update-fcm-token.dto.js';
import { SearchUserDto } from './dto/search-user.dto.js';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async getMe(userId: string) {
    const user = await this.prisma.user.findFirst({
      where: { id: userId, deletedAt: null },
      select: {
        id: true,
        email: true,
        username: true,
        displayName: true,
        avatarUrl: true,
        bio: true,
        provider: true,
        fcmToken: true,
        notifyReactions: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException('USER_NOT_FOUND');
    }

    return user;
  }

  async updateMe(userId: string, dto: UpdateUserDto) {
    await this.getMe(userId);

    return this.prisma.user.update({
      where: { id: userId },
      data: {
        ...(dto.displayName !== undefined && { displayName: dto.displayName }),
        ...(dto.bio !== undefined && { bio: dto.bio }),
        ...(dto.avatarUrl !== undefined && { avatarUrl: dto.avatarUrl }),
        ...(dto.notifyReactions !== undefined && { notifyReactions: dto.notifyReactions }),
      },
      select: {
        id: true,
        email: true,
        username: true,
        displayName: true,
        avatarUrl: true,
        bio: true,
        provider: true,
        notifyReactions: true,
        updatedAt: true,
      },
    });
  }

  async updateFcmToken(userId: string, dto: UpdateFcmTokenDto) {
    await this.getMe(userId);

    await this.prisma.user.update({
      where: { id: userId },
      data: { fcmToken: dto.fcmToken },
    });

    return { success: true };
  }

  async searchUsers(currentUserId: string, query: SearchUserDto) {
    const take = query.limit ? Math.min(parseInt(query.limit, 10) || 20, 50) : 20;
    const cleanQuery = query.q?.trim().toLowerCase();

    if (!cleanQuery) {
      return [];
    }

    return this.prisma.user.findMany({
      where: {
        deletedAt: null,
        id: { not: currentUserId },
        OR: [
          { username: { equals: cleanQuery, mode: 'insensitive' } },
          { email: { equals: cleanQuery, mode: 'insensitive' } },
        ],
      },
      take,
      select: {
        id: true,
        username: true,
        displayName: true,
        avatarUrl: true,
        bio: true,
      },
      orderBy: { username: 'asc' },
    });
  }

  async deleteAccount(userId: string) {
    await this.getMe(userId);

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        deletedAt: new Date(),
        fcmToken: null,
      },
    });

    // Cleanup active refresh tokens upon soft deletion
    await this.prisma.refreshToken.deleteMany({
      where: { userId },
    });

    return { success: true, message: 'Account deleted successfully' };
  }
}
