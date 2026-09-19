import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service.js';
import { CreateReactionDto } from './dto/create-reaction.dto.js';

@Injectable()
export class InteractionsService {
  constructor(private readonly prisma: PrismaService) {}

  private async getActiveMoment(momentId: string) {
    const moment = await this.prisma.moment.findFirst({
      where: { id: momentId, deletedAt: null },
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
    });

    if (!moment) {
      throw new NotFoundException('MOMENT_NOT_FOUND');
    }

    return moment;
  }

  // --- REACTIONS ---
  async addOrUpdateReaction(userId: string, momentId: string, dto: CreateReactionDto) {
    await this.getActiveMoment(momentId);

    return this.prisma.reaction.upsert({
      where: {
        momentId_userId: {
          momentId,
          userId,
        },
      },
      create: {
        momentId,
        userId,
        type: dto.type,
      },
      update: {
        type: dto.type,
      },
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
    });
  }

  async removeReaction(userId: string, momentId: string) {
    await this.getActiveMoment(momentId);

    const existing = await this.prisma.reaction.findUnique({
      where: {
        momentId_userId: {
          momentId,
          userId,
        },
      },
    });

    if (!existing) {
      throw new NotFoundException('REACTION_NOT_FOUND');
    }

    await this.prisma.reaction.delete({
      where: {
        momentId_userId: {
          momentId,
          userId,
        },
      },
    });

    return { success: true, message: 'Reaction removed successfully' };
  }

  // --- MOMENT INTERACTIONS SUMMARY & THREADS ---
  async getMomentInteractions(userId: string, momentId: string) {
    const moment = await this.getActiveMoment(momentId);
    const isOwner = moment.userId === userId;

    if (isOwner) {
      // 1. Author: Lấy tất cả Reactions
      const reactions = await this.prisma.reaction.findMany({
        where: { momentId },
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
        orderBy: { createdAt: 'desc' },
      });

      // 2. Author: Lấy tất cả Messages trích dẫn moment này
      const messages = await this.prisma.message.findMany({
        where: {
          momentId,
          deletedAt: null,
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
            },
          },
        },
        orderBy: { createdAt: 'asc' },
      });

      // Gom nhóm tin nhắn theo từng người bạn (Friend Thread)
      const threadMap = new Map<string, { friend: any; conversationId: string; messages: any[] }>();

      for (const msg of messages) {
        const friendMember = msg.conversation.members.find((m) => m.userId !== userId);
        if (!friendMember) continue;

        const friendId = friendMember.userId;
        if (!threadMap.has(friendId)) {
          threadMap.set(friendId, {
            friend: friendMember.user,
            conversationId: msg.conversationId,
            messages: [],
          });
        }

        threadMap.get(friendId)!.messages.push({
          id: msg.id,
          conversationId: msg.conversationId,
          senderId: msg.senderId,
          content: msg.content,
          type: msg.type,
          momentId: msg.momentId,
          createdAt: msg.createdAt,
          sender: msg.sender,
        });
      }

      const threads = Array.from(threadMap.values()).map((t) => ({
        friend: t.friend,
        conversationId: t.conversationId,
        lastMessage: t.messages[t.messages.length - 1] || null,
        messages: t.messages,
      }));

      return {
        momentId,
        isOwner: true,
        reactions,
        threads,
      };
    } else {
      // Viewer: Lấy reaction của chính mình
      const myReaction = await this.prisma.reaction.findUnique({
        where: {
          momentId_userId: {
            momentId,
            userId,
          },
        },
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
      });

      // Viewer: Lấy các tin nhắn trích dẫn moment này trong cuộc trò chuyện giữa viewer và owner
      const conversationMembership = await this.prisma.conversationMember.findFirst({
        where: {
          userId,
          conversation: {
            isGroup: false,
            members: {
              some: {
                userId: moment.userId,
              },
            },
          },
        },
      });

      let messages: any[] = [];
      if (conversationMembership) {
        messages = await this.prisma.message.findMany({
          where: {
            conversationId: conversationMembership.conversationId,
            momentId,
            deletedAt: null,
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
          },
          orderBy: { createdAt: 'asc' },
        });
      }

      return {
        momentId,
        isOwner: false,
        reactions: [],
        myReaction: myReaction || null,
        threads: conversationMembership
          ? [
              {
                friend: moment.user,
                conversationId: conversationMembership.conversationId,
                lastMessage: messages[messages.length - 1] || null,
                messages,
              },
            ]
          : [],
      };
    }
  }
}
