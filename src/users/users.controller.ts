import { Controller, Get, Query } from '@nestjs/common';
import { ApiBasicAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { GetUsersDto } from './dto/get-users.dto';

@ApiTags('users')
@Controller('users')
@ApiBasicAuth()
export class UsersController {
  @Get('')
  @ApiOperation({
    summary: '회원 조회',
  })
  async getUsers(@Query() query: GetUsersDto) {
    return {
      total: 0,
      results: [],
    };
  }
}
