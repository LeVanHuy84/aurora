import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export enum MediaFolder {
  MOMENTS = 'moments',
  AVATARS = 'avatars',
}

export class GeneratePresignedUrlDto {
  @ApiPropertyOptional({
    enum: MediaFolder,
    default: MediaFolder.MOMENTS,
    description: 'Target upload folder on Cloudinary',
  })
  @IsOptional()
  @IsEnum(MediaFolder)
  folder?: MediaFolder = MediaFolder.MOMENTS;

  @ApiPropertyOptional({
    example: 'custom_filename',
    description: 'Optional custom public ID for the uploaded asset',
  })
  @IsOptional()
  @IsString()
  publicId?: string;
}
