import { IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateUserDto {
  @ApiPropertyOptional({ example: 'Aurora Member Updated', description: 'User display name' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  displayName?: string;

  @ApiPropertyOptional({ example: 'Living my best private life ✨', description: 'User bio' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  bio?: string;

  @ApiPropertyOptional({ example: 'https://res.cloudinary.com/aurora/avatar.jpg', description: 'Avatar Cloudinary URL' })
  @IsOptional()
  @IsString()
  avatarUrl?: string;
}
