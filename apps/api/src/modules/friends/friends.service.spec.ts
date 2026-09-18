import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, ConflictException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { FriendshipStatus } from '@prisma/client';
import { FriendsService } from './friends.service.js';
import { PrismaService } from '../../common/prisma/prisma.service.js';

describe('FriendsService', () => {
  let service: FriendsService;

  const mockFriendship = {
    id: 'friendship-uuid-1',
    requesterId: 'user-uuid-1',
    receiverId: 'user-uuid-2',
    status: FriendshipStatus.PENDING,
    isCloseFriend: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    requester: {
      id: 'user-uuid-1',
      username: 'user_1',
      displayName: 'User One',
      avatarUrl: null,
      bio: null,
    },
    receiver: {
      id: 'user-uuid-2',
      username: 'user_2',
      displayName: 'User Two',
      avatarUrl: null,
      bio: null,
    },
  };

  const mockPrismaService = {
    friendship: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    user: {
      findFirst: vi.fn(),
    },
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FriendsService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<FriendsService>(FriendsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getFriends', () => {
    it('should return mapped friends list', async () => {
      mockPrismaService.friendship.findMany.mockResolvedValue([
        { ...mockFriendship, status: FriendshipStatus.ACCEPTED },
      ]);

      const result = await service.getFriends('user-uuid-1');

      expect(result).toHaveLength(1);
      expect(result[0].user.id).toBe('user-uuid-2');
    });
  });

  describe('getPendingRequests', () => {
    it('should return pending requests for user', async () => {
      mockPrismaService.friendship.findMany.mockResolvedValue([mockFriendship]);

      const result = await service.getPendingRequests('user-uuid-2');

      expect(result).toHaveLength(1);
    });
  });

  describe('sendRequest', () => {
    it('should throw BadRequestException if receiver is self', async () => {
      await expect(
        service.sendRequest('user-uuid-1', { receiverId: 'user-uuid-1' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException if receiver does not exist', async () => {
      mockPrismaService.user.findFirst.mockResolvedValue(null);

      await expect(
        service.sendRequest('user-uuid-1', { receiverId: 'user-uuid-2' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ConflictException if already friends', async () => {
      mockPrismaService.user.findFirst.mockResolvedValue(mockFriendship.receiver);
      mockPrismaService.friendship.findFirst.mockResolvedValue({
        ...mockFriendship,
        status: FriendshipStatus.ACCEPTED,
      });

      await expect(
        service.sendRequest('user-uuid-1', { receiverId: 'user-uuid-2' }),
      ).rejects.toThrow(ConflictException);
    });

    it('should create new friend request', async () => {
      mockPrismaService.user.findFirst.mockResolvedValue(mockFriendship.receiver);
      mockPrismaService.friendship.findFirst.mockResolvedValue(null);
      mockPrismaService.friendship.create.mockResolvedValue(mockFriendship);

      const result = await service.sendRequest('user-uuid-1', { receiverId: 'user-uuid-2' });

      expect(result).toEqual(mockFriendship);
    });
  });

  describe('acceptRequest', () => {
    it('should throw NotFoundException if request not found', async () => {
      mockPrismaService.friendship.findUnique.mockResolvedValue(null);

      await expect(
        service.acceptRequest('user-uuid-2', 'invalid-id'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if current user is not receiver', async () => {
      mockPrismaService.friendship.findUnique.mockResolvedValue(mockFriendship);

      await expect(
        service.acceptRequest('user-uuid-1', 'friendship-uuid-1'),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should accept friend request', async () => {
      mockPrismaService.friendship.findUnique.mockResolvedValue(mockFriendship);
      mockPrismaService.friendship.update.mockResolvedValue({
        ...mockFriendship,
        status: FriendshipStatus.ACCEPTED,
      });

      const result = await service.acceptRequest('user-uuid-2', 'friendship-uuid-1');

      expect(result.status).toBe(FriendshipStatus.ACCEPTED);
    });
  });

  describe('removeFriendship', () => {
    it('should remove friendship successfully', async () => {
      mockPrismaService.friendship.findUnique.mockResolvedValue(mockFriendship);
      mockPrismaService.friendship.delete.mockResolvedValue(mockFriendship);

      const result = await service.removeFriendship('user-uuid-1', 'friendship-uuid-1');

      expect(result.success).toBe(true);
    });
  });

  describe('updateCloseFriend', () => {
    it('should toggle close friend status', async () => {
      mockPrismaService.friendship.findUnique.mockResolvedValue({
        ...mockFriendship,
        status: FriendshipStatus.ACCEPTED,
      });
      mockPrismaService.friendship.update.mockResolvedValue({
        ...mockFriendship,
        status: FriendshipStatus.ACCEPTED,
        isCloseFriend: true,
      });

      const result = await service.updateCloseFriend('user-uuid-1', 'friendship-uuid-1', {
        isCloseFriend: true,
      });

      expect(result.isCloseFriend).toBe(true);
    });
  });
});
