import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { FriendshipStatus, MomentType, Visibility } from '@prisma/client';
import { MomentsService } from './moments.service.js';
import { PrismaService } from '../../common/prisma/prisma.service.js';
import { NotificationsService } from '../notifications/notifications.service.js';

describe('MomentsService', () => {
  let service: MomentsService;

  const mockMoment = {
    id: 'moment-uuid-1',
    userId: 'user-uuid-1',
    type: MomentType.PHOTO,
    content: 'Great view!',
    imageUrl: 'https://example.com/img.jpg',
    emotionId: 'emotion-uuid-1',
    visibility: Visibility.ONLY_ME,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
    emotion: {
      id: 'emotion-uuid-1',
      code: 'HAPPY',
      label: 'Happy',
      icon: '😊',
      color: '#FFD700',
    },
    user: {
      id: 'user-uuid-1',
      username: 'aurora_user',
      displayName: 'Aurora User',
      avatarUrl: null,
    },
  };

  const mockPrismaService = {
    moment: {
      create: vi.fn(),
      findMany: vi.fn(),
      findFirst: vi.fn(),
      update: vi.fn(),
    },
    emotion: {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      upsert: vi.fn(),
      create: vi.fn(),
    },
    friendship: {
      findMany: vi.fn(),
    },
  };

  const mockNotificationsService = {
    notifyNewMoment: vi.fn().mockResolvedValue(undefined),
    notifyMomentReaction: vi.fn().mockResolvedValue(undefined),
    notifyReaction: vi.fn().mockResolvedValue(undefined),
    notifyNewMessage: vi.fn().mockResolvedValue(undefined),
    notifyFriendRequest: vi.fn().mockResolvedValue(undefined),
    notifyFriendAccepted: vi.fn().mockResolvedValue(undefined),
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MomentsService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: NotificationsService, useValue: mockNotificationsService },
      ],
    }).compile();

    service = module.get<MomentsService>(MomentsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should throw BadRequestException if PHOTO type is missing imageUrl', async () => {
      await expect(
        service.create('user-uuid-1', {
          type: MomentType.PHOTO,
          content: 'No image',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException if emotion does not exist in DB', async () => {
      mockPrismaService.emotion.findUnique.mockResolvedValue(null);

      await expect(
        service.create('user-uuid-1', {
          type: MomentType.NOTE,
          content: 'Note',
          emotionId: 'UNKNOWN_CODE',
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should create moment successfully with emotion code', async () => {
      mockPrismaService.emotion.findUnique.mockResolvedValue(mockMoment.emotion);
      mockPrismaService.moment.create.mockResolvedValue(mockMoment);

      const result = await service.create('user-uuid-1', {
        type: MomentType.NOTE,
        content: 'Note',
        emotionId: 'HAPPY',
      });

      expect(mockPrismaService.emotion.findUnique).toHaveBeenCalledWith({
        where: { code: 'HAPPY' },
      });
      expect(result).toEqual(mockMoment);
    });

    it('should create moment successfully with UUID emotionId', async () => {
      mockPrismaService.emotion.findUnique.mockResolvedValue(mockMoment.emotion);
      mockPrismaService.moment.create.mockResolvedValue(mockMoment);

      const result = await service.create('user-uuid-1', {
        type: MomentType.PHOTO,
        content: 'Great view!',
        imageUrl: 'https://example.com/img.jpg',
        emotionId: '123e4567-e89b-12d3-a456-426614174000',
        visibility: Visibility.ONLY_ME,
      });

      expect(mockPrismaService.emotion.findUnique).toHaveBeenCalledWith({
        where: { id: '123e4567-e89b-12d3-a456-426614174000' },
      });
      expect(result).toEqual(mockMoment);
      expect(mockPrismaService.moment.create).toHaveBeenCalled();
    });
  });

  describe('getToday', () => {
    it('should fetch moments with friendships filtered', async () => {
      mockPrismaService.friendship.findMany.mockResolvedValue([
        {
          id: 'f-1',
          requesterId: 'user-uuid-1',
          receiverId: 'friend-1',
          status: FriendshipStatus.ACCEPTED,
          isCloseFriend: true,
        },
        {
          id: 'f-2',
          requesterId: 'friend-2',
          receiverId: 'user-uuid-1',
          status: FriendshipStatus.ACCEPTED,
          isCloseFriend: false,
        },
      ]);
      mockPrismaService.moment.findMany.mockResolvedValue([mockMoment]);

      const result = await service.getToday('user-uuid-1');

      expect(result).toHaveLength(1);
      expect(mockPrismaService.moment.findMany).toHaveBeenCalled();
    });
  });

  describe('getCalendar', () => {
    it('should throw BadRequestException on invalid month', async () => {
      await expect(
        service.getCalendar('user-uuid-1', { month: '13', year: '2026' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should return moments within month range', async () => {
      mockPrismaService.moment.findMany.mockResolvedValue([mockMoment]);

      const result = await service.getCalendar('user-uuid-1', { month: '09', year: '2026' });

      expect(result).toEqual([mockMoment]);
    });
  });

  describe('getHistory', () => {
    it('should paginate items with cursor', async () => {
      mockPrismaService.moment.findMany.mockResolvedValue([mockMoment]);

      const result = await service.getHistory('user-uuid-1', { limit: '10' });

      expect(result.items).toHaveLength(1);
      expect(result.meta.hasMore).toBe(false);
      expect(result.meta.nextCursor).toBeNull();
    });
  });

  describe('findOne', () => {
    it('should throw NotFoundException if moment not found', async () => {
      mockPrismaService.moment.findFirst.mockResolvedValue(null);

      await expect(service.findOne('user-uuid-1', 'invalid-id')).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if viewing private moment of another user', async () => {
      mockPrismaService.moment.findFirst.mockResolvedValue({
        ...mockMoment,
        userId: 'other-user',
        visibility: Visibility.ONLY_ME,
      });

      await expect(service.findOne('user-uuid-1', 'moment-uuid-1')).rejects.toThrow(ForbiddenException);
    });

    it('should return moment if authorized', async () => {
      mockPrismaService.moment.findFirst.mockResolvedValue(mockMoment);

      const result = await service.findOne('user-uuid-1', 'moment-uuid-1');

      expect(result).toMatchObject(mockMoment);
      expect(result.hasReacted).toBe(false);
    });
  });

  describe('remove', () => {
    it('should throw NotFoundException if moment not found', async () => {
      mockPrismaService.moment.findFirst.mockResolvedValue(null);

      await expect(service.remove('user-uuid-1', 'invalid-id')).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if deleting other user moment', async () => {
      mockPrismaService.moment.findFirst.mockResolvedValue({
        ...mockMoment,
        userId: 'other-user',
      });

      await expect(service.remove('user-uuid-1', 'moment-uuid-1')).rejects.toThrow(ForbiddenException);
    });

    it('should soft delete moment successfully', async () => {
      mockPrismaService.moment.findFirst.mockResolvedValue(mockMoment);
      mockPrismaService.moment.update.mockResolvedValue({ ...mockMoment, deletedAt: new Date() });

      const result = await service.remove('user-uuid-1', 'moment-uuid-1');

      expect(result.success).toBe(true);
      expect(mockPrismaService.moment.update).toHaveBeenCalledWith({
        where: { id: 'moment-uuid-1' },
        data: { deletedAt: expect.any(Date) },
      });
    });
  });
});
