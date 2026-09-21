import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class GetCalendarQueryDto {
  @ApiPropertyOptional({ example: '09', description: 'Month in 2 digits (01-12)' })
  @Transform(({ value }) => String(value))
  @IsString()
  @IsNotEmpty()
  month: string;

  @ApiPropertyOptional({ example: '2026', description: 'Year in 4 digits (e.g. 2026)' })
  @Transform(({ value }) => String(value))
  @IsString()
  @IsNotEmpty()
  year: string;
}

export class GetHistoryQueryDto {
  @ApiPropertyOptional({ example: 'd3b07384-d113-40e4-a123-123456789abc', description: 'Cursor ID for pagination' })
  @IsOptional()
  @IsString()
  cursor?: string;

  @ApiPropertyOptional({ example: '20', description: 'Limit items per page' })
  @IsOptional()
  @IsString()
  limit?: string;
}

export class GetHomeFeedQueryDto extends GetHistoryQueryDto {}
