import { ApiProperty } from '@nestjs/swagger';

export class ChangePasswordDto {
  @ApiProperty({
    title: '현재 비밀번호',
  })
  password: string;

  @ApiProperty({
    title: '변경할 비밀번호',
  })
  newPassword: string;
}
