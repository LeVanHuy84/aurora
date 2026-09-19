import { IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MessageType } from '@prisma/client';

export class SendMessageDto {
  @ApiProperty({ example: 'Trông tuyệt vời quá!', description: 'Nội dung tin nhắn' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(1000)
  content: string;

  @ApiPropertyOptional({ example: '123e4567-e89b-12d3-a456-426614174000', description: 'ID Moment được trích dẫn (nếu có)' })
  @IsOptional()
  @IsUUID()
  momentId?: string;

  @ApiPropertyOptional({ enum: MessageType, default: MessageType.TEXT, description: 'Loại tin nhắn' })
  @IsOptional()
  @IsEnum(MessageType)
  type?: MessageType;
}
