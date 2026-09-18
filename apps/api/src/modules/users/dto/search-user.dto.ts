import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class SearchUserDto {
  @ApiPropertyOptional({ example: 'aurora', description: 'Search query for username or displayName' })
  @IsString()
  @IsNotEmpty()
  q: string;

  @ApiPropertyOptional({ example: '20', description: 'Limit results' })
  @IsOptional()
  @IsString()
  limit?: string;
}
