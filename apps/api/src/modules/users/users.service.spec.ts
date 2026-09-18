import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { UsersService } from './users.service.js';
import { PrismaService } from '../../common/prisma/prisma.service.js';

describe('UsersService', () => {
  let service: UsersService;

  const mockUser = {
    id: 'user-uuid-1',
    email: 'user@example.com',
    username: 'aurora_user',
    displayName: 'Aurora User',
    avatarUrl: 'https://example.com/avatar.jpg',
    bio: 'My bio',
    provider: 'LOCAL',
    fcmToken: 'fcm-token-123',
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  };

  const mockPrismaService = {
    user: {
      findFirst: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
    },
    refreshToken: {
      deleteMany: vi.fn(),
    },
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getMe', () => {
    it('should return current user profile', async () => {
      mockPrismaService.user.findFirst.mockResolvedValue(mockUser);

      const result = await service.getMe('user-uuid-1');

      expect(result).toEqual(mockUser);
      expect(mockPrismaService.user.findFirst).toHaveBeenCalledWith({
        where: { id: 'user-uuid-1', deletedAt: null },
        select: expect.any(Object),
      });
    });

    it('should throw NotFoundException if user not found or deleted', async () => {
      mockPrismaService.user.findFirst.mockResolvedValue(null);

      await expect(service.getMe('invalid-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateMe', () => {
    it('should update user profile fields', async () => {
      mockPrismaService.user.findFirst.mockResolvedValue(mockUser);
      mockPrismaService.user.update.mockResolvedValue({
        ...mockUser,
        displayName: 'New Name',
      });

      const result = await service.updateMe('user-uuid-1', { displayName: 'New Name' });

      expect(result.displayName).toBe('New Name');
      expect(mockPrismaService.user.update).toHaveBeenCalledWith({
        where: { id: 'user-uuid-1' },
        data: { displayName: 'New Name' },
        select: expect.any(Object),
      });
    });
  });

  describe('updateFcmToken', () => {
    it('should update fcm token', async () => {
      mockPrismaService.user.findFirst.mockResolvedValue(mockUser);
      mockPrismaService.user.update.mockResolvedValue({ ...mockUser, fcmToken: 'new-token' });

      const result = await service.updateFcmToken('user-uuid-1', { fcmToken: 'new-token' });

      expect(result).toEqual({ success: true });
      expect(mockPrismaService.user.update).toHaveBeenCalledWith({
        where: { id: 'user-uuid-1' },
        data: { fcmToken: 'new-token' },
      });
    });
  });

  describe('searchUsers', () => {
    it('should search users excluding current user and deleted users', async () => {
      mockPrismaService.user.findMany.mockResolvedValue([
        {
          id: 'user-uuid-2',
          username: 'friend_user',
          displayName: 'Friend',
          avatarUrl: null,
          bio: null,
        },
      ]);

      const result = await service.searchUsers('user-uuid-1', { q: 'friend' });

      expect(result).toHaveLength(1);
      expect(mockPrismaService.user.findMany).toHaveBeenCalledWith({
        where: {
          deletedAt: null,
          id: { not: 'user-uuid-1' },
          OR: [
            { username: { contains: 'friend', mode: 'insensitive' } },
            { displayName: { contains: 'friend', mode: 'insensitive' } },
          ],
        },
        take: 20,
        select: expect.any(Object),
        orderBy: { username: 'asc' },
      });
    });
  });

  describe('deleteAccount', () => {
    it('should soft delete user and delete refresh tokens', async () => {
      mockPrismaService.user.findFirst.mockResolvedValue(mockUser);
      mockPrismaService.user.update.mockResolvedValue({ ...mockUser, deletedAt: new Date() });
      mockPrismaService.refreshToken.deleteMany.mockResolvedValue({ count: 1 });

      const result = await service.deleteAccount('user-uuid-1');

      expect(result.success).toBe(true);
      expect(mockPrismaService.user.update).toHaveBeenCalledWith({
        where: { id: 'user-uuid-1' },
        data: {
          deletedAt: expect.any(Date),
          fcmToken: null,
        },
      });
      expect(mockPrismaService.refreshToken.deleteMany).toHaveBeenCalledWith({
        where: { userId: 'user-uuid-1' },
      });
    });
  });
});
