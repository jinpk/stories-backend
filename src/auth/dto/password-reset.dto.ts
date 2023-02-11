import { ApiProperty } from '@nestjs/swagger';
import { DynamicLinkQuery } from 'src/firebase/interfaces';

export class PasswordResetQueryDto implements DynamicLinkQuery {
  @ApiProperty({
    description: '"passwordreset" 고정',
  })
  action: string;

  @ApiProperty({
    description: '비밀번호 초기화 JWT',
  })
  payload: string;
}
