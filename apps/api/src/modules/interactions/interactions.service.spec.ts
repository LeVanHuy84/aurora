import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { InteractionsService } from './interactions.service.js';
import { PrismaService } from '../../common/prisma/prisma.service.js';

describe('InteractionsService', () => {
  let service: InteractionsService;

  const mockMoment = {
    id: 'moment-uuid-1',
    userId: 'user-uuid-1',
    deletedAt: null,
  };

  const mockReaction = {
    id: 'reaction-uuid-1',
    momentId: 'moment-uuid-1',
    userId: 'user-uuid-2',
    type: 'LOVE',
    createdAt: new Date(),
  };

  const mockComment = {
    id: 'comment-uuid-1',
    momentId: 'moment-uuid-1',
    userId: 'user-uuid-2',
    content: 'Love this moment!',
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
    moment: mockMoment,
    user: {
      id: 'user-uuid-2',
      username: 'friend',
      displayName: 'Friend Name',
      avatarUrl: null,
    },
  };

  const mockPrismaService = {
    moment: {
      findFirst: vi.fn(),
    },
    reaction: {
      upsert: vi.fn(),
      findUnique: vi.fn(),
      delete: vi.fn(),
    },
    comment: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InteractionsService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<InteractionsService>(InteractionsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('addOrUpdateReaction', () => {
    it('should throw NotFoundException if moment does not exist', async () => {
      mockPrismaService.moment.findFirst.mockResolvedValue(null);

      await expect(
        service.addOrUpdateReaction('user-uuid-1', 'invalid-moment', { type: 'LOVE' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should upsert reaction successfully', async () => {
      mockPrismaService.moment.findFirst.mockResolvedValue(mockMoment);
      mockPrismaService.reaction.upsert.mockResolvedValue(mockReaction);

      const result = await service.addOrUpdateReaction('user-uuid-2', 'moment-uuid-1', { type: 'LOVE' });

      expect(result).toEqual(mockReaction);
      expect(mockPrismaService.reaction.upsert).toHaveBeenCalled();
    });
  });

  describe('removeReaction', () => {
    it('should throw NotFoundException if reaction does not exist', async () => {
      mockPrismaService.moment.findFirst.mockResolvedValue(mockMoment);
      mockPrismaService.reaction.findUnique.mockResolvedValue(null);

      await expect(
        service.removeReaction('user-uuid-2', 'moment-uuid-1'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should delete reaction successfully', async () => {
      mockPrismaService.moment.findFirst.mockResolvedValue(mockMoment);
      mockPrismaService.reaction.findUnique.mockResolvedValue(mockReaction);
      mockPrismaService.reaction.delete.mockResolvedValue(mockReaction);

      const result = await service.removeReaction('user-uuid-2', 'moment-uuid-1');

      expect(result.success).toBe(true);
    });
  });

  describe('getComments', () => {
    it('should return comments for moment author', async () => {
      mockPrismaService.moment.findFirst.mockResolvedValue(mockMoment);
      mockPrismaService.comment.findMany.mockResolvedValue([mockComment]);

      const result = await service.getComments('user-uuid-1', 'moment-uuid-1');

      expect(result).toHaveLength(1);
    });
  });

  describe('addComment', () => {
    it('should create comment on moment', async () => {
      mockPrismaService.moment.findFirst.mockResolvedValue(mockMoment);
      mockPrismaService.comment.create.mockResolvedValue(mockComment);

      const result = await service.addComment('user-uuid-2', 'moment-uuid-1', {
        content: 'Love this moment!',
      });

      expect(result).toEqual(mockComment);
    });
  });

  describe('deleteComment', () => {
    it('should throw NotFoundException if comment not found', async () => {
      mockPrismaService.comment.findFirst.mockResolvedValue(null);

      await expect(
        service.deleteComment('user-uuid-2', 'invalid-id'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if user is neither comment author nor moment author', async () => {
      mockPrismaService.comment.findFirst.mockResolvedValue({
        ...mockComment,
        userId: 'author-comment',
        moment: { userId: 'author-moment' },
      });

      await expect(
        service.deleteComment('stranger-user', 'comment-uuid-1'),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should soft delete comment if user is comment author', async () => {
      mockPrismaService.comment.findFirst.mockResolvedValue(mockComment);
      mockPrismaService.comment.update.mockResolvedValue({
        ...mockComment,
        deletedAt: new Date(),
      });

      const result = await service.deleteComment('user-uuid-2', 'comment-uuid-1');

      expect(result.success).toBe(true);
      expect(mockPrismaService.comment.update).toHaveBeenCalledWith({
        where: { id: 'comment-uuid-1' },
        data: { deletedAt: expect.any(Date) },
      });
    });
  });
});
