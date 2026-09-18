import { IsBoolean, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateCloseFriendDto {
  @ApiProperty({ example: true, description: 'Set whether this friend is marked as Close Friend' })
  @IsBoolean()
  @IsNotEmpty()
  isCloseFriend: boolean;
}
