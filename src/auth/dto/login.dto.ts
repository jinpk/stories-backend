import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class LoginDto {
  @ApiProperty({ description: '이메일' })
  @IsEmail()
  email: string;

  @ApiProperty({ description: '비밀번호' })
  @IsNotEmpty()
  password: string;
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
