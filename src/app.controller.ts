import { Controller, Get } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { Public } from './auth/decorator/auth.decorator';

@Controller()
export class AppController {
  @Get('health')
  @Public()
  @ApiOperation({ summary: 'Health check' })
  getHealth() {
    return 'Success';
  }
}
