import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class UpdateUserDto {
  @ApiProperty({ description: 'Firebase messaging token', required: false })
  @IsOptional()
  fcmToken?: string;

  @ApiProperty({ description: 'nickname', required: false })
  @IsOptional()
  @IsString()
  nickname?: string;

  @ApiProperty({ description: '뉴스레터 구독 여부', required: false })
  @IsOptional()
  @IsBoolean()
  subNewsletter?: boolean;
}
