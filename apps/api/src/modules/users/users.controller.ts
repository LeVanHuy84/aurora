import { Body, Controller, Delete, Get, Patch, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UsersService } from './users.service.js';
import { UpdateUserDto } from './dto/update-user.dto.js';
import { UpdateFcmTokenDto } from './dto/update-fcm-token.dto.js';
import { SearchUserDto } from './dto/search-user.dto.js';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';

@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @ApiOperation({ summary: 'Get current user profile and settings' })
  @ApiResponse({ status: 200, description: 'Current user profile returned' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getMe(@CurrentUser('userId') userId: string) {
    return this.usersService.getMe(userId);
  }

  @Patch('me')
  @ApiOperation({ summary: 'Update profile information (displayName, bio, avatarUrl)' })
  @ApiResponse({ status: 200, description: 'User profile updated successfully' })
  @ApiResponse({ status: 400, description: 'Validation failed' })
  async updateMe(
    @CurrentUser('userId') userId: string,
    @Body() dto: UpdateUserDto,
  ) {
    return this.usersService.updateMe(userId, dto);
  }

  @Patch('me/fcm-token')
  @ApiOperation({ summary: 'Update device FCM Push Token' })
  @ApiResponse({ status: 200, description: 'FCM Token updated successfully' })
  async updateFcmToken(
    @CurrentUser('userId') userId: string,
    @Body() dto: UpdateFcmTokenDto,
  ) {
    return this.usersService.updateFcmToken(userId, dto);
  }

  @Get('search')
  @ApiOperation({ summary: 'Search users by username or displayName' })
  @ApiResponse({ status: 200, description: 'Matching users list returned' })
  async searchUsers(
    @CurrentUser('userId') userId: string,
    @Query() query: SearchUserDto,
  ) {
    return this.usersService.searchUsers(userId, query);
  }

  @Delete('me')
  @ApiOperation({ summary: 'Request account soft deletion' })
  @ApiResponse({ status: 200, description: 'Account marked as deleted' })
  async deleteAccount(@CurrentUser('userId') userId: string) {
    return this.usersService.deleteAccount(userId);
  }
}
