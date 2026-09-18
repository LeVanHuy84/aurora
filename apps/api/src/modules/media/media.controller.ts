import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { MediaService } from './media.service.js';
import { GeneratePresignedUrlDto } from './dto/generate-presigned-url.dto.js';

@ApiTags('Media')
@ApiBearerAuth()
@Controller('media')
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @HttpCode(HttpStatus.OK)
  @Post('presigned-url')
  @ApiOperation({ summary: 'Generate presigned Cloudinary signature for direct mobile upload' })
  @ApiResponse({ status: 200, description: 'Presigned signature returned successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  generatePresignedUrl(@Body() dto: GeneratePresignedUrlDto) {
    return this.mediaService.generatePresignedSignature(dto);
  }
}
