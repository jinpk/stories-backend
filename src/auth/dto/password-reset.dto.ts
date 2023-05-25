import { ApiProperty } from '@nestjs/swagger';
import { DynamicLinkActions } from 'src/common/enums';
import { DynamicLinkQuery } from 'src/common/interfaces';

export class PasswordResetQueryDto implements DynamicLinkQuery {
  @ApiProperty({
    description: '"passwordreset" 고정',
  })
  action: DynamicLinkActions.PasswordReset;

  @ApiProperty({
    description: '비밀번호 초기화 JWT',
  })
  payload: string;
}
