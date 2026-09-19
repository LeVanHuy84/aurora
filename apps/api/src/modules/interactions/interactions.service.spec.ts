import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { InteractionsService } from './interactions.service.js';
import { PrismaService } from '../../common/prisma/prisma.service.js';

describe('InteractionsService', () => {
  let service: InteractionsService;

  const mockMoment = {
    id: 'moment-uuid-1',
    userId: 'user-uuid-1',
    deletedAt: null,
    user: {
      id: 'user-uuid-1',
      username: 'author',
      displayName: 'Author Name',
      avatarUrl: null,
    },
  };

  const mockReaction = {
    id: 'reaction-uuid-1',
    momentId: 'moment-uuid-1',
    userId: 'user-uuid-2',
    type: 'LOVE',
    createdAt: new Date(),
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
      findMany: vi.fn(),
      delete: vi.fn(),
    },
    message: {
      findMany: vi.fn(),
    },
    conversationMember: {
      findFirst: vi.fn(),
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

  describe('getMomentInteractions', () => {
    it('should return reactions and grouped threads for owner', async () => {
      mockPrismaService.moment.findFirst.mockResolvedValue(mockMoment);
      mockPrismaService.reaction.findMany.mockResolvedValue([mockReaction]);
      mockPrismaService.message.findMany.mockResolvedValue([
        {
          id: 'msg-1',
          conversationId: 'conv-1',
          senderId: 'user-uuid-2',
          content: 'Cool photo!',
          type: 'MOMENT_REPLY',
          momentId: 'moment-uuid-1',
          createdAt: new Date(),
          sender: { id: 'user-uuid-2', username: 'friend', displayName: 'Friend', avatarUrl: null },
          conversation: {
            members: [
              { userId: 'user-uuid-1', user: mockMoment.user },
              { userId: 'user-uuid-2', user: { id: 'user-uuid-2', username: 'friend', displayName: 'Friend', avatarUrl: null } },
            ],
          },
        },
      ]);

      const result = await service.getMomentInteractions('user-uuid-1', 'moment-uuid-1');

      expect(result.isOwner).toBe(true);
      expect(result.reactions).toHaveLength(1);
      expect(result.threads).toHaveLength(1);
      expect(result.threads[0].friend.id).toBe('user-uuid-2');
    });

    it('should return viewer reaction and 1-1 thread for viewer', async () => {
      mockPrismaService.moment.findFirst.mockResolvedValue(mockMoment);
      mockPrismaService.reaction.findUnique.mockResolvedValue(mockReaction);
      mockPrismaService.conversationMember.findFirst.mockResolvedValue({
        conversationId: 'conv-1',
      });
      mockPrismaService.message.findMany.mockResolvedValue([
        {
          id: 'msg-1',
          conversationId: 'conv-1',
          senderId: 'user-uuid-2',
          content: 'Awesome moment',
          type: 'MOMENT_REPLY',
          momentId: 'moment-uuid-1',
          createdAt: new Date(),
          sender: mockReaction.user,
        },
      ]);

      const result = await service.getMomentInteractions('user-uuid-2', 'moment-uuid-1');

      expect(result.isOwner).toBe(false);
      expect(result.myReaction).toEqual(mockReaction);
      expect(result.threads).toHaveLength(1);
    });
  });
});
