import {
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
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
    const user = await this.usersService.findById(id);
    if (!user) {
      throw new NotFoundException();
    }

    return this.usersService._userDocToDto(user);
  }

  @Delete(':id')
  @ApiOperation({
    summary: '회원 탈퇴(삭제)',
  })
  @ApiOkResponse({
    description: 'deleted.',
  })
  async deleteUser(@Param('id') id: string, @Req() req) {
    if (req.user.id !== id && !req.user.isAdmin) {
      throw new UnauthorizedException();
    }
    if (!(await this.usersService.findById(id))) {
      throw new NotFoundException();
    }
    await this.usersService.deleteUser(id);
  }
}
