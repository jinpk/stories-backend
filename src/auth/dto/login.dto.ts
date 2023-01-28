import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsJWT, isJWT, IsNotEmpty } from 'class-validator';
import { OAuthProviers } from '../enums';

export class LoginDto {
  @ApiProperty({ description: '이메일' })
  @IsEmail()
  email: string;

  @ApiProperty({ description: '비밀번호' })
  @IsNotEmpty()
  password: string;
}

export class OAuthDto {
  @ApiProperty({ description: 'OAuth Provider', enum: OAuthProviers })
  @IsEnum(OAuthProviers)
  @IsNotEmpty()
  provider: string;

  @ApiProperty({ description: '각 SNS 클라인트에서 Login후 발급 받은 code' })
  @IsNotEmpty()
  code: string;
}

export class TokenDto {
  @ApiProperty({ description: 'Bearer token' })
  accessToken: string;
}

export class AdminLoginDto {
  @ApiProperty({
    description: '로그인 아이디',
  })
  @IsNotEmpty()
  username: string;
  @IsNotEmpty()
  @ApiProperty({
    description: '로그인 비밀번호',
  })
  password: string;
}

export class PasswordResetDto {
  @ApiProperty({ description: '변경할 비밀번호' })
  @IsNotEmpty()
  password: string;

  @ApiProperty({ description: '이메일 링크 query에서 파싱한 token (JWT)' })
  @IsNotEmpty()
  @IsJWT()
  token: string;
}
