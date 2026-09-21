import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
  namespace: '/',
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(ChatGateway.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async handleConnection(client: Socket) {
    try {
      const rawToken =
        client.handshake.auth?.token ||
        (client.handshake.headers?.authorization as string);

      if (!rawToken) {
        this.logger.warn(`WS connection rejected: No token provided (${client.id})`);
        client.disconnect();
        return;
      }

      const token = rawToken.replace(/^Bearer\s+/i, '');
      const secret =
        this.configService.get<string>('JWT_SECRET') ||
        'aurora_super_secret_jwt_key_change_me_in_production';

      const payload = await this.jwtService.verifyAsync(token, { secret });
      const userId = payload.userId || payload.sub;

      if (!userId) {
        this.logger.warn(`WS connection rejected: Invalid payload (${client.id})`);
        client.disconnect();
        return;
      }

      client.data.userId = userId;
      // Join room định danh theo user để nhận thông báo / inbox real-time
      await client.join(`user_${userId}`);
      this.logger.log(`WS Client connected: ${client.id} (User: ${userId})`);
    } catch (err: any) {
      this.logger.warn(`WS Authentication failed: ${err.message} (${client.id})`);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`WS Client disconnected: ${client.id} (User: ${client.data.userId})`);
  }

  @SubscribeMessage('join_conversation')
  async handleJoinConversation(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { conversationId: string },
  ) {
    if (!data?.conversationId) return;
    const room = `conversation_${data.conversationId}`;
    await client.join(room);
    this.logger.debug(`User ${client.data.userId} joined ${room}`);
  }

  @SubscribeMessage('leave_conversation')
  async handleLeaveConversation(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { conversationId: string },
  ) {
    if (!data?.conversationId) return;
    const room = `conversation_${data.conversationId}`;
    await client.leave(room);
    this.logger.debug(`User ${client.data.userId} left ${room}`);
  }

  @SubscribeMessage('typing')
  handleTyping(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { conversationId: string; isTyping: boolean },
  ) {
    if (!data?.conversationId) return;
    const userId = client.data.userId;
    this.logger.debug(
      `User ${userId} typing in conversation ${data.conversationId}: ${data.isTyping}`,
    );
    // Broadcast trạng thái gõ chữ tới các thành viên khác trong phòng chat
    client.to(`conversation_${data.conversationId}`).emit('user_typing', {
      conversationId: data.conversationId,
      userId,
      isTyping: Boolean(data.isTyping),
    });
  }

  /**
   * Broadcast tin nhắn mới tới phòng chat và các user liên quan
   */
  broadcastNewMessage(
    conversationId: string,
    message: any,
    targetUserIds: string[] = [],
  ) {
    // 1. Gửi tới những ai đang ở trong phòng chat
    this.server.to(`conversation_${conversationId}`).emit('new_message', message);

    // 2. Gửi tới các user ngoài phòng chat để cập nhật Inbox tức thì
    for (const userId of targetUserIds) {
      this.server.to(`user_${userId}`).emit('inbox_updated', {
        conversationId,
        lastMessage: message,
      });
    }
  }

  /**
   * Broadcast sự kiện đánh dấu đã đọc
   */
  broadcastConversationRead(conversationId: string, readerUserId: string) {
    this.server
      .to(`conversation_${conversationId}`)
      .emit('conversation_read', { conversationId, userId: readerUserId });
  }
}
