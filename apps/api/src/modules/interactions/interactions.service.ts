import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service.js';
import { CreateReactionDto } from './dto/create-reaction.dto.js';
import { CreateCommentDto } from './dto/create-comment.dto.js';

@Injectable()
export class InteractionsService {
  constructor(private readonly prisma: PrismaService) {}

  private async getActiveMoment(momentId: string) {
    const moment = await this.prisma.moment.findFirst({
      where: { id: momentId, deletedAt: null },
    });

    if (!moment) {
      throw new NotFoundException('Moment not found');
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
      throw new NotFoundException('Reaction not found');
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

  // --- PRIVATE 1-1 COMMENTS ---
  async getComments(userId: string, momentId: string) {
    const moment = await this.getActiveMoment(momentId);

    // Rule: Author views all comments. Friends only view their own conversation comments with author.
    const isOwner = moment.userId === userId;

    return this.prisma.comment.findMany({
      where: {
        momentId,
        deletedAt: null,
        ...(!isOwner && {
          OR: [{ userId }, { moment: { userId } }],
        }),
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
      orderBy: { createdAt: 'asc' },
    });
  }

  async addComment(userId: string, momentId: string, dto: CreateCommentDto) {
    await this.getActiveMoment(momentId);

    return this.prisma.comment.create({
      data: {
        momentId,
        userId,
        content: dto.content,
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

  async deleteComment(userId: string, commentId: string) {
    const comment = await this.prisma.comment.findFirst({
      where: { id: commentId, deletedAt: null },
      include: { moment: true },
    });

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    // Either author of comment or author of moment can delete
    if (comment.userId !== userId && comment.moment.userId !== userId) {
      throw new ForbiddenException('You do not have permission to delete this comment');
    }

    await this.prisma.comment.update({
      where: { id: commentId },
      data: { deletedAt: new Date() },
    });

    return { success: true, message: 'Comment deleted successfully' };
  }
}
