import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateUserDto {
  @ApiProperty({ description: 'Firebase messaging token', required: false })
  @IsOptional()
  fcmToken?: string;

  @ApiProperty({ description: 'Stories Nickname', required: false })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  nickname?: string;
}
