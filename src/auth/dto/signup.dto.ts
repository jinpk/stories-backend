import { ApiProperty, PickType } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
import { LoginDto } from './login.dto';

export class SignUpDto extends PickType(LoginDto, ['password']) {
  @ApiProperty({ description: '닉네임' })
  @IsNotEmpty()
  nickname: string;

  @ApiProperty({ description: '이름' })
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: '인증 ID (코드인증까지 완료)' })
  @IsNotEmpty()
  verifiId: string;

  @ApiProperty({ description: '국가 2자리 코드' })
  @IsNotEmpty()
  countryCode: string;
}
