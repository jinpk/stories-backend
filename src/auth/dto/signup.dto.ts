import { ApiProperty, PickType } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
import { LoginDto } from './login.dto';

export class SignUpDto extends PickType(LoginDto, ['password']) {
  @ApiProperty({ required: true, description: '닉네임' })
  @IsNotEmpty()
  nickname: string;

  @ApiProperty({ required: true, description: '이름' })
  @IsNotEmpty()
  name: string;

  @ApiProperty({ required: true, description: '인증 ID (코드인증까지 완료)' })
  @IsNotEmpty()
  verifiId: string;
}
