import { Controller, Get, Param } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { UserDto } from './dto/user.dto';
import { UsersService } from './users.service';

@Controller('users')
@ApiTags('users')
@ApiBearerAuth()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get(':id')
  @ApiOperation({
    summary: '회원 상세 조회',
  })
  @ApiOkResponse({
    type: UserDto,
  })
  async getUser(@Param('id') id: string) {
    console.log('wdawdawdawd');
    const user = new UserDto();
    return user;
  }
}
