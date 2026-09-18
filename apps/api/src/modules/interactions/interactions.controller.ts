import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { InteractionsService } from './interactions.service.js';
import { CreateReactionDto } from './dto/create-reaction.dto.js';
import { CreateCommentDto } from './dto/create-comment.dto.js';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';

@ApiTags('Interactions (Reactions & Comments)')
@ApiBearerAuth()
@Controller()
export class InteractionsController {
  constructor(private readonly interactionsService: InteractionsService) {}

  // --- REACTIONS ---
  @Post('moments/:momentId/reactions')
  @ApiOperation({ summary: 'Add or update reaction on a moment (LOVE, FUNNY, RELATABLE, NICE, SUPPORT)' })
  @ApiResponse({ status: 200, description: 'Reaction set successfully' })
  @ApiResponse({ status: 404, description: 'Moment not found' })
  async addReaction(
    @CurrentUser('userId') userId: string,
    @Param('momentId') momentId: string,
    @Body() dto: CreateReactionDto,
  ) {
    return this.interactionsService.addOrUpdateReaction(userId, momentId, dto);
  }

  @Delete('moments/:momentId/reactions')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Remove reaction from a moment' })
  @ApiResponse({ status: 200, description: 'Reaction removed successfully' })
  @ApiResponse({ status: 404, description: 'Reaction or moment not found' })
  async removeReaction(
    @CurrentUser('userId') userId: string,
    @Param('momentId') momentId: string,
  ) {
    return this.interactionsService.removeReaction(userId, momentId);
  }

  // --- COMMENTS ---
  @Get('moments/:momentId/comments')
  @ApiOperation({ summary: 'Get comments on a moment (Author views all, friends view their 1-1 conversation)' })
  @ApiResponse({ status: 200, description: 'Comments list returned' })
  async getComments(
    @CurrentUser('userId') userId: string,
    @Param('momentId') momentId: string,
  ) {
    return this.interactionsService.getComments(userId, momentId);
  }

  @Post('moments/:momentId/comments')
  @ApiOperation({ summary: 'Post private comment on a moment' })
  @ApiResponse({ status: 201, description: 'Comment created successfully' })
  async addComment(
    @CurrentUser('userId') userId: string,
    @Param('momentId') momentId: string,
    @Body() dto: CreateCommentDto,
  ) {
    return this.interactionsService.addComment(userId, momentId, dto);
  }

  @Delete('comments/:commentId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete comment (Author of comment or author of moment)' })
  @ApiResponse({ status: 200, description: 'Comment deleted successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Comment not found' })
  async deleteComment(
    @CurrentUser('userId') userId: string,
    @Param('commentId') commentId: string,
  ) {
    return this.interactionsService.deleteComment(userId, commentId);
  }
}
