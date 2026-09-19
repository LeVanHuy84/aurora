import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service.js';
import { SendMessageDto } from './dto/send-message.dto.js';
import { GetMessagesQueryDto } from './dto/get-messages-query.dto.js';
import { MessageType } from '@prisma/client';

@Injectable()
export class ChatService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Lấy danh sách các cuộc trò chuyện của User
   */
  async getConversations(userId: string) {
    const memberships = await this.prisma.conversationMember.findMany({
      where: { userId },
      include: {
        conversation: {
          include: {
            members: {
              include: {
                user: {
                  select: {
                    id: true,
                    username: true,
                    displayName: true,
                    avatarUrl: true,
                    bio: true,
                  },
                },
              },
            },
            messages: {
              where: { deletedAt: null },
              orderBy: { createdAt: 'desc' },
              take: 1,
              include: {
                sender: {
                  select: {
                    id: true,
                    username: true,
                    displayName: true,
                    avatarUrl: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: {
        conversation: {
          lastMessageAt: 'desc',
        },
      },
    });

    const result = await Promise.all(
      memberships.map(async (membership) => {
        const conv = membership.conversation;
        const friendMember = conv.members.find((m) => m.userId !== userId);
        const lastMessage = conv.messages[0] || null;

        // Tính số lượng tin nhắn chưa đọc
        const unreadCount = await this.prisma.message.count({
          where: {
            conversationId: conv.id,
            senderId: { not: userId },
            deletedAt: null,
            ...(membership.lastReadAt && {
              createdAt: { gt: membership.lastReadAt },
            }),
          },
        });

        return {
          id: conv.id,
          isGroup: conv.isGroup,
          name: conv.name,
          lastMessageAt: conv.lastMessageAt,
          createdAt: conv.createdAt,
          updatedAt: conv.updatedAt,
          friend: friendMember?.user || null,
          lastMessage,
          unreadCount,
          members: conv.members.map((m) => ({
            id: m.id,
            userId: m.userId,
            lastReadAt: m.lastReadAt,
            joinedAt: m.joinedAt,
            user: m.user,
          })),
        };
      }),
    );

    return result;
  }

  /**
   * Lấy hoặc tạo mới cuộc trò chuyện 1-1 với một bạn bè
   */
  async getOrCreateDirectConversation(userId: string, friendId: string) {
    if (userId === friendId) {
      throw new BadRequestException('CANNOT_CHAT_WITH_YOURSELF');
    }

    const friend = await this.prisma.user.findFirst({
      where: { id: friendId, deletedAt: null },
      select: {
        id: true,
        username: true,
        displayName: true,
        avatarUrl: true,
        bio: true,
      },
    });

    if (!friend) {
      throw new NotFoundException('USER_NOT_FOUND');
    }

    // Tìm cuộc trò chuyện 1-1 đã tồn tại giữa 2 user
    const existingMembership = await this.prisma.conversationMember.findFirst({
      where: {
        userId,
        conversation: {
          isGroup: false,
          members: {
            some: {
              userId: friendId,
            },
          },
        },
      },
      include: {
        conversation: {
          include: {
            members: {
              include: {
                user: {
                  select: {
                    id: true,
                    username: true,
                    displayName: true,
                    avatarUrl: true,
                  },
                },
              },
            },
            messages: {
              where: { deletedAt: null },
              orderBy: { createdAt: 'desc' },
              take: 1,
            },
          },
        },
      },
    });

    if (existingMembership) {
      const conv = existingMembership.conversation;
      return {
        id: conv.id,
        isGroup: conv.isGroup,
        name: conv.name,
        lastMessageAt: conv.lastMessageAt,
        createdAt: conv.createdAt,
        updatedAt: conv.updatedAt,
        friend,
        lastMessage: conv.messages[0] || null,
        unreadCount: 0,
      };
    }

    // Nếu chưa có, tạo mới cuộc trò chuyện
    const newConversation = await this.prisma.conversation.create({
      data: {
        isGroup: false,
        members: {
          create: [
            { userId },
            { userId: friendId },
          ],
        },
      },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                displayName: true,
                avatarUrl: true,
              },
            },
          },
        },
      },
    });

    return {
      id: newConversation.id,
      isGroup: newConversation.isGroup,
      name: newConversation.name,
      lastMessageAt: newConversation.lastMessageAt,
      createdAt: newConversation.createdAt,
      updatedAt: newConversation.updatedAt,
      friend,
      lastMessage: null,
      unreadCount: 0,
    };
  }

  /**
   * Lấy lịch sử tin nhắn trong một cuộc trò chuyện
   */
  async getMessages(userId: string, conversationId: string, query: GetMessagesQueryDto) {
    // Kiểm tra quyền truy cập (user phải là thành viên cuộc trò chuyện)
    const membership = await this.prisma.conversationMember.findUnique({
      where: {
        conversationId_userId: {
          conversationId,
          userId,
        },
      },
    });

    if (!membership) {
      throw new ForbiddenException('NOT_A_CONVERSATION_MEMBER');
    }

    const limit = query.limit ? Math.min(parseInt(query.limit, 10) || 30, 50) : 30;

    const messages = await this.prisma.message.findMany({
      where: {
        conversationId,
        deletedAt: null,
      },
      take: limit + 1,
      ...(query.cursor && {
        cursor: { id: query.cursor },
        skip: 1,
      }),
      orderBy: { createdAt: 'desc' },
      include: {
        sender: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatarUrl: true,
          },
        },
        moment: {
          select: {
            id: true,
            type: true,
            content: true,
            imageUrl: true,
            createdAt: true,
            userId: true,
            emotion: true,
          },
        },
      },
    });

    const hasMore = messages.length > limit;
    const items = hasMore ? messages.slice(0, limit) : messages;
    const nextCursor = hasMore ? items[items.length - 1].id : null;

    return {
      items,
      meta: {
        hasMore,
        nextCursor,
        limit,
      },
    };
  }

  /**
   * Gửi tin nhắn mới vào cuộc trò chuyện
   */
  async sendMessage(userId: string, conversationId: string, dto: SendMessageDto) {
    const membership = await this.prisma.conversationMember.findUnique({
      where: {
        conversationId_userId: {
          conversationId,
          userId,
        },
      },
    });

    if (!membership) {
      throw new ForbiddenException('NOT_A_CONVERSATION_MEMBER');
    }

    if (dto.momentId) {
      const moment = await this.prisma.moment.findFirst({
        where: { id: dto.momentId, deletedAt: null },
      });
      if (!moment) {
        throw new NotFoundException('MOMENT_NOT_FOUND');
      }
    }

    const messageType = dto.type || (dto.momentId ? MessageType.MOMENT_REPLY : MessageType.TEXT);

    const message = await this.prisma.message.create({
      data: {
        conversationId,
        senderId: userId,
        content: dto.content,
        momentId: dto.momentId,
        type: messageType,
      },
      include: {
        sender: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatarUrl: true,
          },
        },
        moment: {
          select: {
            id: true,
            type: true,
            content: true,
            imageUrl: true,
            createdAt: true,
            userId: true,
            emotion: true,
          },
        },
      },
    });

    const now = new Date();

    // Cập nhật lastMessageAt cho cuộc trò chuyện
    await this.prisma.conversation.update({
      where: { id: conversationId },
      data: { lastMessageAt: now },
    });

    // Cập nhật lastReadAt cho người gửi
    await this.prisma.conversationMember.update({
      where: {
        conversationId_userId: {
          conversationId,
          userId,
        },
      },
      data: { lastReadAt: now },
    });

    return message;
  }

  /**
   * Đánh dấu đã đọc tất cả tin nhắn trong cuộc trò chuyện
   */
  async markAsRead(userId: string, conversationId: string) {
    const membership = await this.prisma.conversationMember.findUnique({
      where: {
        conversationId_userId: {
          conversationId,
          userId,
        },
      },
    });

    if (!membership) {
      throw new ForbiddenException('NOT_A_CONVERSATION_MEMBER');
    }

    await this.prisma.conversationMember.update({
      where: {
        conversationId_userId: {
          conversationId,
          userId,
        },
      },
      data: { lastReadAt: new Date() },
    });

    return { success: true };
  }
}
