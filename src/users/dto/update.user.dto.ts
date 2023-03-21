import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateUserTTMIKDto {
  @ApiProperty({ description: 'Stories Nickname', required: false })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  nickname?: string;

  @ApiProperty({
    description: 'TTMIK Web 결제회원 여부',
    required: false,
  })
  @IsOptional()
  ttmik?: boolean;
}

export class UpdateUserByEmail extends UpdateUserTTMIKDto {
  @ApiProperty({ description: 'Token signed by TTMIK', required: true })
  @IsString()
  @IsNotEmpty()
  token?: string;
}

export class UpdateUserDto extends UpdateUserTTMIKDto {
  @ApiProperty({ description: 'Firebase messaging token', required: false })
  @IsOptional()
  fcmToken?: string;

  @ApiProperty({
    description: '뉴스레터 구독',
    required: false,
  })
  @IsOptional()
  newsletter?: boolean;
}
