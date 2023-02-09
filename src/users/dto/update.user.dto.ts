import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

export class UpdateUserDto {
  @ApiProperty({ description: 'Firebase messaging token', required: false })
  @IsOptional()
  fcmToken?: string;
}
