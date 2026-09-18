import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { FriendsService } from './friends.service.js';
import { SendFriendRequestDto } from './dto/send-friend-request.dto.js';
import { UpdateCloseFriendDto } from './dto/update-close-friend.dto.js';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';

@ApiTags('Friends')
@ApiBearerAuth()
@Controller('friends')
export class FriendsController {
  constructor(private readonly friendsService: FriendsService) {}

  @Get()
  @ApiOperation({ summary: 'Get current accepted friends list' })
  @ApiResponse({ status: 200, description: 'Friends list returned' })
  async getFriends(@CurrentUser('userId') userId: string) {
    return this.friendsService.getFriends(userId);
  }

  @Get('requests/pending')
  @ApiOperation({ summary: 'Get list of pending friend requests received' })
  @ApiResponse({ status: 200, description: 'Pending friend requests returned' })
  async getPendingRequests(@CurrentUser('userId') userId: string) {
    return this.friendsService.getPendingRequests(userId);
  }

  @Post('request')
  @ApiOperation({ summary: 'Send a friend request to another user' })
  @ApiResponse({ status: 201, description: 'Friend request sent' })
  @ApiResponse({ status: 400, description: 'Cannot send request to yourself' })
  @ApiResponse({ status: 404, description: 'Receiver not found' })
  @ApiResponse({ status: 409, description: 'Already friends or request pending' })
  async sendRequest(
    @CurrentUser('userId') userId: string,
    @Body() dto: SendFriendRequestDto,
  ) {
    return this.friendsService.sendRequest(userId, dto);
  }

  @Patch('accept/:friendshipId')
  @ApiOperation({ summary: 'Accept a received friend request' })
  @ApiResponse({ status: 200, description: 'Friend request accepted' })
  @ApiResponse({ status: 403, description: 'Only receiver can accept' })
  @ApiResponse({ status: 404, description: 'Friend request not found' })
  async acceptRequest(
    @CurrentUser('userId') userId: string,
    @Param('friendshipId') friendshipId: string,
  ) {
    return this.friendsService.acceptRequest(userId, friendshipId);
  }

  @Delete(':friendshipId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Remove a friend or decline/cancel a friend request' })
  @ApiResponse({ status: 200, description: 'Friendship removed successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Friendship not found' })
  async removeFriendship(
    @CurrentUser('userId') userId: string,
    @Param('friendshipId') friendshipId: string,
  ) {
    return this.friendsService.removeFriendship(userId, friendshipId);
  }

  @Patch('close-friend/:friendshipId')
  @ApiOperation({ summary: 'Toggle Close Friend status for an accepted friendship' })
  @ApiResponse({ status: 200, description: 'Close friend status updated' })
  @ApiResponse({ status: 400, description: 'Friendship not accepted yet' })
  @ApiResponse({ status: 404, description: 'Friendship not found' })
  async updateCloseFriend(
    @CurrentUser('userId') userId: string,
    @Param('friendshipId') friendshipId: string,
    @Body() dto: UpdateCloseFriendDto,
  ) {
    return this.friendsService.updateCloseFriend(userId, friendshipId, dto);
  }
}
