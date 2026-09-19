import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { FriendshipStatus } from '@prisma/client';
import { PrismaService } from '../../common/prisma/prisma.service.js';
import { SendFriendRequestDto } from './dto/send-friend-request.dto.js';
import { UpdateCloseFriendDto } from './dto/update-close-friend.dto.js';

@Injectable()
export class FriendsService {
  constructor(private readonly prisma: PrismaService) {}

  async getFriends(userId: string) {
    const friendships = await this.prisma.friendship.findMany({
      where: {
        status: FriendshipStatus.ACCEPTED,
        OR: [{ requesterId: userId }, { receiverId: userId }],
      },
      include: {
        requester: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatarUrl: true,
            bio: true,
          },
        },
        receiver: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatarUrl: true,
            bio: true,
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    return friendships.map((f) => {
      const friend = f.requesterId === userId ? f.receiver : f.requester;
      return {
        id: f.id,
        friendshipId: f.id,
        requesterId: f.requesterId,
        receiverId: f.receiverId,
        status: f.status,
        isCloseFriend: f.isCloseFriend,
        createdAt: f.createdAt,
        friend,
        user: friend,
      };
    });
  }

  async getPendingRequests(userId: string) {
    const requests = await this.prisma.friendship.findMany({
      where: {
        receiverId: userId,
        status: FriendshipStatus.PENDING,
      },
      include: {
        requester: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatarUrl: true,
            bio: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return requests.map((r) => ({
      id: r.id,
      friendshipId: r.id,
      requesterId: r.requesterId,
      receiverId: r.receiverId,
      status: r.status,
      isCloseFriend: r.isCloseFriend,
      createdAt: r.createdAt,
      friend: r.requester,
      requester: r.requester,
      user: r.requester,
    }));
  }

  async sendRequest(userId: string, dto: SendFriendRequestDto) {
    if (userId === dto.receiverId) {
      throw new BadRequestException('CANNOT_FRIEND_SELF');
    }

    const receiver = await this.prisma.user.findFirst({
      where: { id: dto.receiverId, deletedAt: null },
    });

    if (!receiver) {
      throw new NotFoundException('RECEIVER_NOT_FOUND');
    }

    const existingFriendship = await this.prisma.friendship.findFirst({
      where: {
        OR: [
          { requesterId: userId, receiverId: dto.receiverId },
          { requesterId: dto.receiverId, receiverId: userId },
        ],
      },
    });

    if (existingFriendship) {
      if (existingFriendship.status === FriendshipStatus.ACCEPTED) {
        throw new ConflictException('ALREADY_FRIENDS');
      }
      if (existingFriendship.status === FriendshipStatus.PENDING) {
        throw new ConflictException('REQUEST_ALREADY_PENDING');
      }
      if (existingFriendship.status === FriendshipStatus.BLOCKED) {
        throw new ForbiddenException('FORBIDDEN');
      }
    }

    return this.prisma.friendship.create({
      data: {
        requesterId: userId,
        receiverId: dto.receiverId,
        status: FriendshipStatus.PENDING,
      },
      include: {
        receiver: {
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

  async acceptRequest(userId: string, friendshipId: string) {
    const friendship = await this.prisma.friendship.findUnique({
      where: { id: friendshipId },
    });

    if (!friendship) {
      throw new NotFoundException('REQUEST_NOT_FOUND');
    }

    if (friendship.receiverId !== userId) {
      throw new ForbiddenException('FORBIDDEN');
    }

    if (friendship.status === FriendshipStatus.ACCEPTED) {
      throw new BadRequestException('ALREADY_FRIENDS');
    }

    return this.prisma.friendship.update({
      where: { id: friendshipId },
      data: { status: FriendshipStatus.ACCEPTED },
    });
  }

  async removeFriendship(userId: string, friendshipId: string) {
    const friendship = await this.prisma.friendship.findUnique({
      where: { id: friendshipId },
    });

    if (!friendship) {
      throw new NotFoundException('Friendship record not found');
    }

    if (friendship.requesterId !== userId && friendship.receiverId !== userId) {
      throw new ForbiddenException('You do not belong to this friendship');
    }

    await this.prisma.friendship.delete({
      where: { id: friendshipId },
    });

    return { success: true, message: 'Friendship removed successfully' };
  }

  async updateCloseFriend(userId: string, friendshipId: string, dto: UpdateCloseFriendDto) {
    const friendship = await this.prisma.friendship.findUnique({
      where: { id: friendshipId },
    });

    if (!friendship) {
      throw new NotFoundException('Friendship record not found');
    }

    if (friendship.requesterId !== userId && friendship.receiverId !== userId) {
      throw new ForbiddenException('You do not belong to this friendship');
    }

    if (friendship.status !== FriendshipStatus.ACCEPTED) {
      throw new BadRequestException('Can only set Close Friend for accepted friendships');
    }

    return this.prisma.friendship.update({
      where: { id: friendshipId },
      data: { isCloseFriend: dto.isCloseFriend },
    });
  }
}
