import { ApiProperty } from '@nestjs/swagger';

export class DeleteUserDto {
  @ApiProperty({ description: '현재 비밀번호', required: false })
  password: string;
}
