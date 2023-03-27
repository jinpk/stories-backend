import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, Length } from 'class-validator';

export * from './login.dto';
export * from './exist-user.dto';
export * from './account.dto';
export * from './password-reset.dto';
export * from './change-password.dto';

export class EmailVerificationReqeust {
  @ApiProperty({ title: '사용자 이메일' })
  @IsEmail()
  @IsNotEmpty()
  email: string;
}

export class EmailVerificationConfirmReqeust {
  @ApiProperty({ title: 'authId' })
  @IsNotEmpty()
  authId: string;

  @ApiProperty({ title: '인증코드 6자리' })
  @IsNotEmpty()
  @Length(6)
  code: string;
}
