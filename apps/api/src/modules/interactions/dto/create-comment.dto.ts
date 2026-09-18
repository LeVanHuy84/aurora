import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCommentDto {
  @ApiProperty({ example: 'Nice moment! 😊', description: 'Private comment content' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(1000)
  content: string;
}
