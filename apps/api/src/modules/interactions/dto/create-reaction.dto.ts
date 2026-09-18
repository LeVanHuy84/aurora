import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateReactionDto {
  @ApiProperty({ example: 'LOVE', description: 'Reaction type: LOVE, FUNNY, RELATABLE, NICE, SUPPORT' })
  @IsString()
  @IsNotEmpty()
  type: string;
}
