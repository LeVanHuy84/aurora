import { IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MomentType, Visibility } from '@prisma/client';

export class CreateMomentDto {
  @ApiProperty({ enum: MomentType, example: MomentType.PHOTO, description: 'Type of moment (PHOTO, NOTE, MOOD)' })
  @IsEnum(MomentType)
  @IsNotEmpty()
  type: MomentType;

  @ApiPropertyOptional({ example: 'Drinking coffee on a rainy afternoon ☕', description: 'Content note or photo caption' })
  @IsOptional()
  @IsString()
  content?: string;

  @ApiPropertyOptional({ example: 'https://res.cloudinary.com/aurora/moment.jpg', description: 'Cloudinary image URL' })
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @ApiPropertyOptional({ example: 'CALM', description: 'Emotion UUID or Code (e.g. CALM, HAPPY, SAD)' })
  @IsOptional()
  @IsString()
  emotionId?: string;

  @ApiProperty({ enum: Visibility, default: Visibility.ONLY_ME, description: 'Visibility status' })
  @IsEnum(Visibility)
  @IsOptional()
  visibility?: Visibility = Visibility.ONLY_ME;
}
