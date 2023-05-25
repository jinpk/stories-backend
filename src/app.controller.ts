import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { Public } from './auth/decorator/auth.decorator';
import { DynamicLinkActions } from './common/enums';

@Controller()
export class AppController {
  @Get('')
  @Public()
  @ApiOperation({ summary: 'Health check' })
  index() {
    return 'Success';
  }

  @Get('health')
  @Public()
  @ApiOperation({ summary: 'Health check' })
  getHealth() {
    return 'Success';
  }

  @Get('link')
  @Public()
  @ApiOperation({
    summary: 'Firebase Dynamic Link Proxy',
    description: `[payload]\n\n${DynamicLinkActions.PasswordReset}:{비밀번호 재설정 토큰}`,
  })
  link(@Query('action') action: DynamicLinkActions, @Query('payload') payload) {
    return 'Success';
  }
}
