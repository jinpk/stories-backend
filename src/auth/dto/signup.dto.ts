import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
import { LoginDto } from './login.dto';

export class SignUpDto extends LoginDto {
  @ApiProperty({ required: true, description: '닉네임 (이름)' })
  @IsNotEmpty()
  nickname: string;
}
