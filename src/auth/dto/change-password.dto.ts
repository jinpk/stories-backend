import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class ChangePasswordDto {
  @ApiProperty({
    title: '현재 비밀번호',
  })
  @IsString()
  @IsNotEmpty()
  password: string;

  @ApiProperty({
    title: '변경할 비밀번호',
  })
  @IsString()
  @IsNotEmpty()
  newPassword: string;
}
