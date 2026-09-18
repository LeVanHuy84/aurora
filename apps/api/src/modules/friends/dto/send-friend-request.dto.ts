import { IsNotEmpty, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SendFriendRequestDto {
  @ApiProperty({ example: 'd3b07384-d113-40e4-a123-123456789abc', description: 'User ID of the receiver' })
  @IsUUID()
  @IsNotEmpty()
  receiverId: string;
}
