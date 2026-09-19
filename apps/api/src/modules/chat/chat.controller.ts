import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ChatService } from './chat.service.js';
import { SendMessageDto } from './dto/send-message.dto.js';
import { GetMessagesQueryDto } from './dto/get-messages-query.dto.js';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';

@ApiTags('Chat & Direct Messaging')
@ApiBearerAuth()
@Controller('conversations')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách các cuộc trò chuyện của người dùng' })
  @ApiResponse({ status: 200, description: 'Danh sách cuộc trò chuyện' })
  async getConversations(@CurrentUser('userId') userId: string) {
    return this.chatService.getConversations(userId);
  }

  @Get('with-user/:friendId')
  @ApiOperation({ summary: 'Lấy hoặc khởi tạo phòng chat 1-1 với một bạn bè' })
  @ApiResponse({ status: 200, description: 'Thông tin phòng chat 1-1' })
  async getOrCreateDirectConversation(
    @CurrentUser('userId') userId: string,
    @Param('friendId') friendId: string,
  ) {
    return this.chatService.getOrCreateDirectConversation(userId, friendId);
  }

  @Get(':conversationId/messages')
  @ApiOperation({ summary: 'Lấy lịch sử tin nhắn trong phòng chat' })
  @ApiResponse({ status: 200, description: 'Danh sách tin nhắn (phân trang)' })
  async getMessages(
    @CurrentUser('userId') userId: string,
    @Param('conversationId') conversationId: string,
    @Query() query: GetMessagesQueryDto,
  ) {
    return this.chatService.getMessages(userId, conversationId, query);
  }

  @Post(':conversationId/messages')
  @ApiOperation({ summary: 'Gửi tin nhắn mới vào phòng chat (hỗ trợ trích dẫn Moment)' })
  @ApiResponse({ status: 201, description: 'Tin nhắn đã được tạo thành công' })
  async sendMessage(
    @CurrentUser('userId') userId: string,
    @Param('conversationId') conversationId: string,
    @Body() dto: SendMessageDto,
  ) {
    return this.chatService.sendMessage(userId, conversationId, dto);
  }

  @Patch(':conversationId/read')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Đánh dấu đã đọc tất cả tin nhắn trong phòng chat' })
  @ApiResponse({ status: 200, description: 'Đã đánh dấu đọc thành công' })
  async markAsRead(
    @CurrentUser('userId') userId: string,
    @Param('conversationId') conversationId: string,
  ) {
    return this.chatService.markAsRead(userId, conversationId);
  }
}
