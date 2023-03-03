import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class DeleteUserDto {
  @ApiProperty({ description: '현재 비밀번호', required: false })
  @IsString()
  password: string;
}
