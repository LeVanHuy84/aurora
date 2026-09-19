import { IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class GetMessagesQueryDto {
  @ApiPropertyOptional({ example: '30', description: 'Số lượng tin nhắn cần lấy' })
  @IsOptional()
  @IsString()
  limit?: string;

  @ApiPropertyOptional({ example: '123e4567-e89b-12d3-a456-426614174000', description: 'Cursor ID của tin nhắn trước đó' })
  @IsOptional()
  @IsString()
  cursor?: string;
}
