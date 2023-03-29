import { ApiProperty } from '@nestjs/swagger';
import {  IsJWT, IsNotEmpty, IsString } from 'class-validator';

export class TokenDto {
  @ApiProperty({ description: 'Bearer token' })
  accessToken: string;
}

export class TTMIKLoginDto {
  @ApiProperty({ description: 'TTMIK JWT' })
  @IsString()
  token: string;

  @ApiProperty({ description: '디바이스 국가코드' })
  @IsString()
  countryCode: string;
}

export class AdminLoginDto {
  @ApiProperty({
    description: '로그인 아이디',
  })
  @IsNotEmpty()
  @IsString()
  username: string;

  @ApiProperty({
    description: '로그인 비밀번호',
  })
  @IsNotEmpty()
  @IsString()
  password: string;
}

export class PasswordResetDto {
  @ApiProperty({ description: '변경할 비밀번호' })
  @IsNotEmpty()
  @IsString()
  password: string;

  @ApiProperty({ description: 'FirebaseDynamicLink url.payload (JWT)' })
  @IsNotEmpty()
  @IsJWT()
  token: string;
}
