import {
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Put,
  Query,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { ApiOkResponsePaginated } from 'src/common/decorators/response.decorator';
import { UserDto } from './dto/user.dto';
import { GetUsersDto } from './dto/get-user.dto';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update.user.dto';

@Controller('users')
@ApiTags('users')
@ApiBearerAuth()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Put(':id')
  @ApiOperation({
    summary: '회원 수정',
  })
  @ApiOkResponse({
    type: UpdateUserDto,
  })
  async updateUser(@Param('id') id: string) {
    return null;
  }

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
  async deleteUser(@Param('id') id: string, @Req() req) {
    if (req.user.id !== id && !req.user.isAdmin) {
      throw new UnauthorizedException();
    }
    if (!(await this.usersService.findById(id))) {
      throw new NotFoundException();
    }
    await this.usersService.deleteUser(id);
  }

  @Get('')
  @ApiOperation({
    summary: '회원 조회',
  })
  @ApiOkResponsePaginated(UserDto)
  async getUserList(@Query() query: GetUsersDto) {
    return [];
  }
}
