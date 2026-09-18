import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { MomentsService } from './moments.service.js';
import { CreateMomentDto } from './dto/create-moment.dto.js';
import { GetCalendarQueryDto, GetHistoryQueryDto } from './dto/query-moment.dto.js';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';

@ApiTags('Moments')
@ApiBearerAuth()
@Controller('moments')
export class MomentsController {
  constructor(private readonly momentsService: MomentsService) {}

  @Post()
  @ApiOperation({ summary: 'Create new moment (PHOTO, NOTE, or MOOD)' })
  @ApiResponse({ status: 201, description: 'Moment created successfully' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  async create(
    @CurrentUser('userId') userId: string,
    @Body() dto: CreateMomentDto,
  ) {
    return this.momentsService.create(userId, dto);
  }

  @Get('today')
  @ApiOperation({ summary: 'Get today timeline moments for user and friends' })
  @ApiResponse({ status: 200, description: 'List of today moments returned' })
  async getToday(@CurrentUser('userId') userId: string) {
    return this.momentsService.getToday(userId);
  }

  @Get('calendar')
  @ApiOperation({ summary: 'Get monthly mood timeline for calendar view' })
  @ApiResponse({ status: 200, description: 'List of moods in month returned' })
  async getCalendar(
    @CurrentUser('userId') userId: string,
    @Query() query: GetCalendarQueryDto,
  ) {
    return this.momentsService.getCalendar(userId, query);
  }

  @Get('history')
  @ApiOperation({ summary: 'Get history moments with cursor-based pagination' })
  @ApiResponse({ status: 200, description: 'Cursor paginated list of moments' })
  async getHistory(
    @CurrentUser('userId') userId: string,
    @Query() query: GetHistoryQueryDto,
  ) {
    return this.momentsService.getHistory(userId, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get single moment details' })
  @ApiResponse({ status: 200, description: 'Moment details returned' })
  @ApiResponse({ status: 404, description: 'Moment not found' })
  async findOne(
    @CurrentUser('userId') userId: string,
    @Param('id') id: string,
  ) {
    return this.momentsService.findOne(userId, id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a moment (Soft delete)' })
  @ApiResponse({ status: 200, description: 'Moment deleted successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Moment not found' })
  async remove(
    @CurrentUser('userId') userId: string,
    @Param('id') id: string,
  ) {
    return this.momentsService.remove(userId, id);
  }
}
