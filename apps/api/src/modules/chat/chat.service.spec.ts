import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { ChatService } from './chat.service.js';
import { PrismaService } from '../../common/prisma/prisma.service.js';
import { NotificationsService } from '../notifications/notifications.service.js';
import { ChatGateway } from './chat.gateway.js';

describe('ChatService', () => {
  let service: ChatService;

  const mockChatGateway = {
    broadcastNewMessage: vi.fn(),
    broadcastConversationRead: vi.fn(),
  };

  const mockUser1 = {
    id: 'user-uuid-1',
    username: 'user1',
    displayName: 'User One',
    avatarUrl: null,
    bio: null,
  };

  const mockUser2 = {
    id: 'user-uuid-2',
    username: 'user2',
    displayName: 'User Two',
    avatarUrl: null,
    bio: null,
  };

  const mockConversation = {
    id: 'conv-uuid-1',
    isGroup: false,
    name: null,
    lastMessageAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
    members: [
      { id: 'm-1', conversationId: 'conv-uuid-1', userId: 'user-uuid-1', user: mockUser1, lastReadAt: new Date(), joinedAt: new Date() },
      { id: 'm-2', conversationId: 'conv-uuid-1', userId: 'user-uuid-2', user: mockUser2, lastReadAt: null, joinedAt: new Date() },
    ],
    messages: [],
  };

  const mockPrismaService = {
    user: {
      findFirst: vi.fn(),
    },
    conversation: {
      create: vi.fn(),
      update: vi.fn(),
    },
    conversationMember: {
      findMany: vi.fn().mockResolvedValue([]),
      findFirst: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    message: {
      count: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
    },
    moment: {
      findFirst: vi.fn(),
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
        ChatService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: NotificationsService, useValue: mockNotificationsService },
        { provide: ChatGateway, useValue: mockChatGateway },
      ],
    }).compile();

    service = module.get<ChatService>(ChatService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getOrCreateDirectConversation', () => {
    it('should throw BadRequestException when chatting with oneself', async () => {
      await expect(
        service.getOrCreateDirectConversation('user-1', 'user-1'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException if friend user does not exist', async () => {
      mockPrismaService.user.findFirst.mockResolvedValue(null);

      await expect(
        service.getOrCreateDirectConversation('user-1', 'invalid-user'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should return existing conversation if found', async () => {
      mockPrismaService.user.findFirst.mockResolvedValue(mockUser2);
      mockPrismaService.conversationMember.findFirst.mockResolvedValue({
        conversation: mockConversation,
      });

      const result = await service.getOrCreateDirectConversation('user-uuid-1', 'user-uuid-2');

      expect(result.id).toBe('conv-uuid-1');
      expect(result.friend).toEqual(mockUser2);
    });

    it('should create new conversation if not found', async () => {
      mockPrismaService.user.findFirst.mockResolvedValue(mockUser2);
      mockPrismaService.conversationMember.findFirst.mockResolvedValue(null);
      mockPrismaService.conversation.create.mockResolvedValue(mockConversation);

      const result = await service.getOrCreateDirectConversation('user-uuid-1', 'user-uuid-2');

      expect(result.id).toBe('conv-uuid-1');
      expect(mockPrismaService.conversation.create).toHaveBeenCalled();
    });
  });

  describe('sendMessage', () => {
    it('should throw ForbiddenException if user is not a member', async () => {
      mockPrismaService.conversationMember.findUnique.mockResolvedValue(null);

      await expect(
        service.sendMessage('stranger', 'conv-1', { content: 'hello' }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should create and return message', async () => {
      mockPrismaService.conversationMember.findUnique.mockResolvedValue({ id: 'm-1' });
      mockPrismaService.message.create.mockResolvedValue({
        id: 'msg-1',
        conversationId: 'conv-1',
        senderId: 'user-uuid-1',
        content: 'Hello friend',
        type: 'TEXT',
        createdAt: new Date(),
        sender: mockUser1,
      });
      mockPrismaService.conversation.update.mockResolvedValue({});
      mockPrismaService.conversationMember.update.mockResolvedValue({});

      const result = await service.sendMessage('user-uuid-1', 'conv-1', { content: 'Hello friend' });

      expect(result.id).toBe('msg-1');
      expect(result.content).toBe('Hello friend');
    });
  });
});
