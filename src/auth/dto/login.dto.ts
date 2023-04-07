import { ApiProperty } from '@nestjs/swagger';
import { IsJWT, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class TokenDto {
  @ApiProperty({ description: 'Bearer token' })
  accessToken: string;
}

export class LoginResponseDto {
  @ApiProperty({ description: '이메일 인증 여부' })
  verified: boolean;

  @ApiProperty({ description: 'Bearer token', required: false })
  accessToken?: string;

  @ApiProperty({ description: '기존 TTMIK 회원이고 인증 안된 경우', required: false })
  email?: string;
}

export class TTMIKLoginDto {
  @ApiProperty({ description: 'TTMIK JWT' })
  @IsString()
  token: string;

  @ApiProperty({ description: 'authId', required: false })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  authId: string;

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
