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
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';

@ApiTags('Interactions (Reactions & Moment Interactions Summary)')
@ApiBearerAuth()
@Controller('moments/:momentId')
export class InteractionsController {
  constructor(private readonly interactionsService: InteractionsService) {}

  // --- REACTIONS ---
  @Post('reactions')
  @ApiOperation({ summary: 'Thả hoặc cập nhật cảm xúc trên Moment (LOVE, CARE, FUNNY, RELATABLE, PROUD)' })
  @ApiResponse({ status: 200, description: 'Đã cập nhật reaction thành công' })
  @ApiResponse({ status: 404, description: 'Moment không tồn tại' })
  async addReaction(
    @CurrentUser('userId') userId: string,
    @Param('momentId') momentId: string,
    @Body() dto: CreateReactionDto,
  ) {
    return this.interactionsService.addOrUpdateReaction(userId, momentId, dto);
  }

  @Delete('reactions')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Gỡ cảm xúc khỏi Moment' })
  @ApiResponse({ status: 200, description: 'Đã gỡ reaction thành công' })
  @ApiResponse({ status: 404, description: 'Reaction hoặc Moment không tồn tại' })
  async removeReaction(
    @CurrentUser('userId') userId: string,
    @Param('momentId') momentId: string,
  ) {
    return this.interactionsService.removeReaction(userId, momentId);
  }

  // --- MOMENT INTERACTIONS (REACTIONS & DIRECT THREADS) ---
  @Get('interactions')
  @ApiOperation({ summary: 'Lấy tổng hợp tương tác của Moment (Reactions & Danh sách tin nhắn trích dẫn)' })
  @ApiResponse({ status: 200, description: 'Dữ liệu tương tác tổng hợp' })
  async getInteractions(
    @CurrentUser('userId') userId: string,
    @Param('momentId') momentId: string,
  ) {
    return this.interactionsService.getMomentInteractions(userId, momentId);
  }
}
