import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  Put,
  Query,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { ApiOkResponsePaginated } from 'src/common/decorators/response.decorator';
import { UserDto } from './dto/user.dto';
import { GetUsersDto } from './dto/get-user.dto';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update.user.dto';
import { DeleteUserDto } from './dto/delete-user.dto';

@Controller('users')
@ApiTags('users')
@ApiBearerAuth()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}
  @Post(':id/withdrawal')
  @ApiOperation({
    summary: '회원 탈퇴(삭제)',
    description: '관리자 요청은 password 필수 아님.',
  })
  async deleteUser(
    @Req() req,
    @Param('id') id: string,
    @Body() body: DeleteUserDto,
  ) {
    console.log(body, id);
    if (req.user.id !== id && !req.user.isAdmin) {
      throw new UnauthorizedException();
    }

    const user = await this.usersService.findById(id);
    if (!user) {
      throw new NotFoundException();
    }

    // ttmik 시스템에 기존 비밀번호 확인하는 로직 필요.

    await this.usersService.deleteUser(id);
  }

  @Put(':id')
  @ApiOperation({
    summary: '회원 수정',
    description: `body에 property가 있는 항목만 업데이트됨`,
  })
  @ApiOkResponse({
    type: UpdateUserDto,
  })
  async updateUser(@Param('id') id: string, @Body() body: UpdateUserDto) {
    const user = await this.usersService.findById(id);
    if (!user) {
      throw new NotFoundException();
    }

    return await this.usersService.updateById(id, body);
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

  /*@Get('')
  @ApiOperation({
    summary: '회원 조회',
  })
  @ApiOkResponsePaginated(UserDto)
  async getUserList(@Query() query: GetUsersDto) {
    return await this.usersService.getPagingUsers(query);
  }*/
}
