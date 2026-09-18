import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { FriendshipStatus, MomentType, Visibility } from '@prisma/client';
import { PrismaService } from '../../common/prisma/prisma.service.js';
import { CreateMomentDto } from './dto/create-moment.dto.js';
import { GetCalendarQueryDto, GetHistoryQueryDto } from './dto/query-moment.dto.js';

@Injectable()
export class MomentsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, dto: CreateMomentDto) {
    if (dto.type === MomentType.PHOTO && !dto.imageUrl) {
      throw new BadRequestException('Image URL is required for PHOTO moment');
    }

    if (dto.emotionId) {
      const emotion = await this.prisma.emotion.findUnique({
        where: { id: dto.emotionId },
      });
      if (!emotion) {
        throw new NotFoundException('Emotion not found');
      }
    }

    return this.prisma.moment.create({
      data: {
        userId,
        type: dto.type,
        content: dto.content,
        imageUrl: dto.imageUrl,
        emotionId: dto.emotionId,
        visibility: dto.visibility || Visibility.ONLY_ME,
      },
      include: {
        emotion: true,
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

  async getToday(userId: string) {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    // Get accepted friends of current user
    const friendships = await this.prisma.friendship.findMany({
      where: {
        status: FriendshipStatus.ACCEPTED,
        OR: [{ requesterId: userId }, { receiverId: userId }],
      },
    });

    const friendIds: string[] = [];
    const closeFriendIds: string[] = [];

    for (const f of friendships) {
      const friendId = f.requesterId === userId ? f.receiverId : f.requesterId;
      friendIds.push(friendId);
      if (f.isCloseFriend) {
        closeFriendIds.push(friendId);
      }
    }

    return this.prisma.moment.findMany({
      where: {
        deletedAt: null,
        createdAt: {
          gte: startOfDay,
          lte: endOfDay,
        },
        OR: [
          // 1. My own moments
          { userId },
          // 2. Friends' moments visible to friends
          {
            userId: { in: friendIds },
            visibility: Visibility.FRIENDS,
          },
          // 3. Close friends' moments visible to close friends
          {
            userId: { in: closeFriendIds },
            visibility: Visibility.CLOSE_FRIENDS,
          },
        ],
      },
      orderBy: { createdAt: 'desc' },
      include: {
        emotion: true,
        user: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatarUrl: true,
          },
        },
        _count: {
          select: {
            reactions: true,
            comments: true,
          },
        },
      },
    });
  }

  async getCalendar(userId: string, query: GetCalendarQueryDto) {
    const month = parseInt(query.month, 10);
    const year = parseInt(query.year, 10);

    if (isNaN(month) || month < 1 || month > 12 || isNaN(year)) {
      throw new BadRequestException('Invalid month or year');
    }

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59, 999);

    const moments = await this.prisma.moment.findMany({
      where: {
        userId,
        deletedAt: null,
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      select: {
        id: true,
        type: true,
        createdAt: true,
        emotion: {
          select: {
            id: true,
            code: true,
            label: true,
            icon: true,
            color: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    return moments;
  }

  async getHistory(userId: string, query: GetHistoryQueryDto) {
    const limit = query.limit ? Math.min(parseInt(query.limit, 10) || 20, 50) : 20;

    const moments = await this.prisma.moment.findMany({
      where: {
        userId,
        deletedAt: null,
      },
      take: limit + 1,
      ...(query.cursor && {
        cursor: { id: query.cursor },
        skip: 1,
      }),
      orderBy: { createdAt: 'desc' },
      include: {
        emotion: true,
        _count: {
          select: {
            reactions: true,
            comments: true,
          },
        },
      },
    });

    const hasMore = moments.length > limit;
    const items = hasMore ? moments.slice(0, limit) : moments;
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

  async findOne(userId: string, momentId: string) {
    const moment = await this.prisma.moment.findFirst({
      where: { id: momentId, deletedAt: null },
      include: {
        emotion: true,
        user: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatarUrl: true,
          },
        },
        _count: {
          select: {
            reactions: true,
            comments: true,
          },
        },
      },
    });

    if (!moment) {
      throw new NotFoundException('Moment not found');
    }

    if (moment.userId !== userId) {
      // Check visibility permission if not owner
      if (moment.visibility === Visibility.ONLY_ME) {
        throw new ForbiddenException('You do not have permission to view this moment');
      }
    }

    return moment;
  }

  async remove(userId: string, momentId: string) {
    const moment = await this.prisma.moment.findFirst({
      where: { id: momentId, deletedAt: null },
    });

    if (!moment) {
      throw new NotFoundException('Moment not found');
    }

    if (moment.userId !== userId) {
      throw new ForbiddenException('You cannot delete someone else moment');
    }

    await this.prisma.moment.update({
      where: { id: momentId },
      data: { deletedAt: new Date() },
    });

    return { success: true, message: 'Moment deleted successfully' };
  }
}
