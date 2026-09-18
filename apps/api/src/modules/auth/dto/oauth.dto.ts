import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class OAuthDto {
  @ApiProperty({ description: 'ID Token received from Google or Apple Sign-In SDK' })
  @IsString()
  @IsNotEmpty()
  idToken: string;
}
