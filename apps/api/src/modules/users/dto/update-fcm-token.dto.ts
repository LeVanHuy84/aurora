import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateFcmTokenDto {
  @ApiProperty({ example: 'fcm-device-token-123456', description: 'Firebase Cloud Messaging Device Push Token' })
  @IsString()
  @IsNotEmpty()
  fcmToken: string;
}
