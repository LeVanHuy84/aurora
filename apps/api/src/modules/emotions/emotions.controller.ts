import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { EmotionsService } from './emotions.service.js';
import { Public } from '../../common/decorators/public.decorator.js';

@ApiTags('Emotions')
@Controller('emotions')
export class EmotionsController {
  constructor(private readonly emotionsService: EmotionsService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Get all active preset emotions' })
  @ApiResponse({ status: 200, description: 'List of master emotions returned' })
  async findAll() {
    return this.emotionsService.findAll();
  }
}
