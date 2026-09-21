import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service.js';
import { FriendshipStatus, Visibility } from '@prisma/client';
import { I18nService } from 'nestjs-i18n';

export interface ExpoPushMessage {
  to: string;
  title: string;
  body: string;
  data?: Record<string, any>;
  sound?: 'default' | null;
  priority?: 'default' | 'normal' | 'high';
  badge?: number;
  channelId?: string;
}

export const REACTION_EMOJI_MAP: Record<string, string> = {
  LOVE: '❤️',
  CARE: '🫂',
  FUNNY: '😂',
  RELATABLE: '🥹',
  PROUD: '✨',
};

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);
  private readonly expoPushUrl = 'https://exp.host/--/api/v2/push/send';

  constructor(
    private readonly prisma: PrismaService,
    private readonly i18n: I18nService,
  ) {}

  /**
   * Kiểm tra định dạng Expo Push Token hợp lệ
   */
  isValidExpoPushToken(token: string): boolean {
    return (
      typeof token === 'string' &&
      (token.startsWith('ExponentPushToken[') || token.startsWith('ExpoPushToken['))
    );
  }

  /**
   * Gửi batch danh sách thông báo qua Expo Push Service
   */
  async sendPushNotifications(messages: ExpoPushMessage[]): Promise<void> {
    const validMessages = messages.filter((msg) => this.isValidExpoPushToken(msg.to));

    if (validMessages.length === 0) {
      return;
    }

    // Expo API cho phép tối đa 100 thông báo / request
    const chunkSize = 100;
    for (let i = 0; i < validMessages.length; i += chunkSize) {
      const chunk = validMessages.slice(i, i + chunkSize);
      try {
        const response = await fetch(this.expoPushUrl, {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Accept-Encoding': 'gzip, deflate',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(chunk),
        });

        if (!response.ok) {
          const errorText = await response.text();
          this.logger.warn(`Expo push failed with status ${response.status}: ${errorText}`);
        }
      } catch (error) {
        this.logger.error('Failed to send push notification chunk to Expo', error);
      }
    }
  }

  /**
   * 1. Thông báo khi có Moment mới (Locket-style)
   */
  async notifyNewMoment(
    authorId: string,
    moment: { id: string; type: string; visibility: Visibility; content?: string | null },
    lang = 'vi',
  ): Promise<void> {
    if (moment.visibility === Visibility.ONLY_ME) {
      return;
    }

    try {
      const author = await this.prisma.user.findUnique({
        where: { id: authorId },
        select: { id: true, username: true, displayName: true },
      });

      if (!author) return;

      const authorName = author.displayName || author.username;

      // Tìm danh sách bạn bè được quyền xem
      const friendships = await this.prisma.friendship.findMany({
        where: {
          status: FriendshipStatus.ACCEPTED,
          OR: [{ requesterId: authorId }, { receiverId: authorId }],
          ...(moment.visibility === Visibility.CLOSE_FRIENDS ? { isCloseFriend: true } : {}),
        },
        include: {
          requester: { select: { id: true, fcmToken: true } },
          receiver: { select: { id: true, fcmToken: true } },
        },
      });

      const recipientTokens = friendships
        .map((f) => (f.requesterId === authorId ? f.receiver : f.requester))
        .filter((user) => user && user.fcmToken)
        .map((user) => user.fcmToken as string);

      if (recipientTokens.length === 0) return;

      const title = this.i18n.t('notifications.NEW_MOMENT_TITLE', {
        lang,
        args: { name: authorName },
      });
      const body = this.i18n.t('notifications.NEW_MOMENT_BODY', { lang });

      const messages: ExpoPushMessage[] = recipientTokens.map((token) => ({
        to: token,
        title,
        body,
        sound: 'default',
        priority: 'high',
        channelId: 'default',
        data: {
          type: 'NEW_MOMENT',
          momentId: moment.id,
          authorId,
        },
      }));

      await this.sendPushNotifications(messages);
    } catch (error) {
      this.logger.error(`Error sending new moment notifications for moment ${moment.id}`, error);
    }
  }

  /**
   * 2. Thông báo khi có tin nhắn Chat 1-1 mới
   */
  async notifyNewMessage(
    senderId: string,
    recipientId: string,
    messageText: string,
    conversationId: string,
    lang = 'vi',
  ): Promise<void> {
    try {
      const [sender, recipient] = await Promise.all([
        this.prisma.user.findUnique({
          where: { id: senderId },
          select: { id: true, username: true, displayName: true },
        }),
        this.prisma.user.findUnique({
          where: { id: recipientId },
          select: { id: true, fcmToken: true },
        }),
      ]);

      if (!sender || !recipient || !recipient.fcmToken) return;

      const senderName = sender.displayName || sender.username;
      const defaultPreview = this.i18n.t('notifications.NEW_MESSAGE_DEFAULT', { lang });
      const previewText = messageText?.trim()
        ? messageText.length > 80
          ? `${messageText.slice(0, 80)}...`
          : messageText
        : defaultPreview;

      const title = this.i18n.t('notifications.NEW_MESSAGE_TITLE', {
        lang,
        args: { name: senderName },
      });

      await this.sendPushNotifications([
        {
          to: recipient.fcmToken,
          title,
          body: previewText,
          sound: 'default',
          priority: 'high',
          channelId: 'chat',
          data: {
            type: 'CHAT_MESSAGE',
            conversationId,
            senderId,
          },
        },
      ]);
    } catch (error) {
      this.logger.error(`Error sending chat push notification to ${recipientId}`, error);
    }
  }

  /**
   * 3. Thông báo khi có Reaction vào Moment
   */
  async notifyReaction(
    actorId: string,
    momentOwnerId: string,
    momentId: string,
    reactionType: string,
    lang = 'vi',
  ): Promise<void> {
    if (actorId === momentOwnerId) return;

    try {
      const [actor, owner] = await Promise.all([
        this.prisma.user.findUnique({
          where: { id: actorId },
          select: { id: true, username: true, displayName: true },
        }),
        this.prisma.user.findUnique({
          where: { id: momentOwnerId },
          select: { id: true, fcmToken: true, notifyReactions: true },
        }),
      ]);

      if (!actor || !owner || !owner.fcmToken || owner.notifyReactions === false) return;

      const actorName = actor.displayName || actor.username;
      const emoji = REACTION_EMOJI_MAP[reactionType.toUpperCase()] || reactionType;

      const title = this.i18n.t('notifications.REACTION_TITLE', {
        lang,
        args: { name: actorName },
      });
      const body = this.i18n.t('notifications.REACTION_BODY', {
        lang,
        args: { emoji },
      });

      await this.sendPushNotifications([
        {
          to: owner.fcmToken,
          title,
          body,
          sound: 'default',
          priority: 'high',
          channelId: 'default',
          data: {
            type: 'MOMENT_REACTION',
            momentId,
            actorId,
          },
        },
      ]);
    } catch (error) {
      this.logger.error(`Error sending reaction notification for moment ${momentId}`, error);
    }
  }

  /**
   * 4. Thông báo khi có Comment vào Moment
   */
  async notifyComment(
    actorId: string,
    momentOwnerId: string,
    momentId: string,
    commentText: string,
    lang = 'vi',
  ): Promise<void> {
    if (actorId === momentOwnerId) return;

    try {
      const [actor, owner] = await Promise.all([
        this.prisma.user.findUnique({
          where: { id: actorId },
          select: { id: true, username: true, displayName: true },
        }),
        this.prisma.user.findUnique({
          where: { id: momentOwnerId },
          select: { id: true, fcmToken: true },
        }),
      ]);

      if (!actor || !owner || !owner.fcmToken) return;

      const actorName = actor.displayName || actor.username;
      const preview =
        commentText.length > 50 ? `${commentText.slice(0, 50)}...` : commentText;

      const title = this.i18n.t('notifications.COMMENT_TITLE', {
        lang,
        args: { name: actorName },
      });
      const body = this.i18n.t('notifications.COMMENT_BODY', {
        lang,
        args: { text: preview },
      });

      await this.sendPushNotifications([
        {
          to: owner.fcmToken,
          title,
          body,
          sound: 'default',
          priority: 'high',
          channelId: 'default',
          data: {
            type: 'MOMENT_COMMENT',
            momentId,
            actorId,
          },
        },
      ]);
    } catch (error) {
      this.logger.error(`Error sending comment notification for moment ${momentId}`, error);
    }
  }

  /**
   * 5. Thông báo khi nhận được Lời mời kết bạn mới
   */
  async notifyFriendRequest(
    senderId: string,
    receiverId: string,
    lang = 'vi',
  ): Promise<void> {
    try {
      const [sender, receiver] = await Promise.all([
        this.prisma.user.findUnique({
          where: { id: senderId },
          select: { id: true, username: true, displayName: true },
        }),
        this.prisma.user.findUnique({
          where: { id: receiverId },
          select: { id: true, fcmToken: true },
        }),
      ]);

      if (!sender || !receiver || !receiver.fcmToken) return;

      const senderName = sender.displayName || sender.username;
      const title = this.i18n.t('notifications.FRIEND_REQUEST_TITLE', { lang });
      const body = this.i18n.t('notifications.FRIEND_REQUEST_BODY', {
        lang,
        args: { name: senderName },
      });

      await this.sendPushNotifications([
        {
          to: receiver.fcmToken,
          title,
          body,
          sound: 'default',
          priority: 'high',
          channelId: 'default',
          data: {
            type: 'FRIEND_REQUEST',
            senderId,
          },
        },
      ]);
    } catch (error) {
      this.logger.error(`Error sending friend request notification to ${receiverId}`, error);
    }
  }
}
