import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class PasswordCheckDto {
  @ApiProperty({ description: '현재 비밀번호' })
  @IsNotEmpty()
  password: string;
}

export class PasswordUpdateDto extends PasswordCheckDto {
  @ApiProperty({ description: '변경 비밀번호' })
  @IsNotEmpty()
  updatePassword: string;
}
