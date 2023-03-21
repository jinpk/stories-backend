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
import { UpdateUserByEmail, UpdateUserDto } from './dto/update.user.dto';
import { DeleteUserDto } from './dto/delete-user.dto';
import { Public } from 'src/auth/decorator/auth.decorator';

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

  @Patch('emails/:email')
  @Public()
  @ApiOperation({
    summary: '회원 수정 by Email',
    description: `body에 property가 있는 항목만 업데이트됨
    \ntoken 필수 값 - (ttmik master pri key로 서명된 토큰 payload에 sub가 -1인지 검증합니다.)`,
  })
  @ApiOkResponse({
    type: UpdateUserByEmail,
  })
  async updateUserTTMIK(
    @Param('email') email: string,
    @Body() body: UpdateUserByEmail,
  ) {
    try {
      const verified = await this.usersService.verifyTTMIKJWT(body.token);
      if (!verified) {
        throw new Error('payload의 sub가 -1이 아닙니다.');
      }
    } catch (error) {
      throw new UnauthorizedException(error.message || '');
    }

    const user = await this.usersService.findOneByEmail(email);
    if (!user) {
      throw new NotFoundException();
    }

    return await this.usersService.updateTTMIKByEmail(email, body);
  }

  @Put(':id')
  @ApiOperation({
    summary: '회원 수정',
    description: `body에 property가 있는 항목만 업데이트됨`,
  })
  @ApiOkResponse({
    type: UpdateUserDto,
  })
  async updateUser(
    @Req() req,
    @Param('id') id: string,
    @Body() body: UpdateUserDto,
  ) {
    if (req.user.id !== id && !req.user.isAdmin) {
      throw new UnauthorizedException();
    }

    const user = await this.usersService.findById(req.user.id);
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

  @Get('')
  @ApiOperation({
    summary: '회원 리스트 조회',
  })
  @ApiOkResponsePaginated(UserDto)
  async getUserList(@Query() query: GetUsersDto) {
    return await this.usersService.getPagingUsers(query);
  }
}
