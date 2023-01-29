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
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { ApiOkResponsePaginated } from 'src/common/decorators/response.decorator';
import { UserDto } from './dto/user.dto';
import { GetUsersDto } from './dto/get-user.dto';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update.user.dto';
import { PasswordCheckDto, PasswordUpdateDto } from './dto/password.dto';
import { DeleteUserDto } from './dto/delete-user.dto';

@Controller('users')
@ApiTags('users')
@ApiBearerAuth()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Patch(':id/password')
  @ApiOperation({
    summary: '비밀번호 경경',
  })
  @ApiBody({ type: PasswordUpdateDto })
  async patchPassword(@Param('id') id: string) {}

  @Post(':id/passwordcheck')
  @ApiOperation({
    summary: '현재 비밀번호 확인',
  })
  @ApiBody({ type: PasswordCheckDto })
  @ApiOkResponse({
    type: Boolean,
  })
  async checkCurrentPassword(@Param('id') id: string) {
    return true;
  }

  @Post(':id/withdrawal')
  @ApiOperation({
    summary: '회원 탈퇴(삭제)',
    description: '관리자 요청은 password 필수 아님.',
  })
  async deleteUser(
    @Param('id') id: string,
    @Body() body: DeleteUserDto,
    @Req() req,
  ) {
    if (req.user.id !== id && !req.user.isAdmin) {
      throw new UnauthorizedException();
    }
    if (!(await this.usersService.findById(id))) {
      throw new NotFoundException();
    }
    await this.usersService.deleteUser(id);
  }

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

  @Get('')
  @ApiOperation({
    summary: '회원 조회',
  })
  @ApiOkResponsePaginated(UserDto)
  async getUserList(@Query() query: GetUsersDto) {
    return [];
  }
}
