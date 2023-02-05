import {
  Body,
  ConflictException,
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
  ApiCreatedResponse,
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
import { CreateUserDto } from './dto/create-user.dto';

@Controller('users')
@ApiTags('users')
@ApiBearerAuth()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Patch(':id/password')
  @ApiOperation({
    summary: '비밀번호 변경',
  })
  @ApiBody({ type: PasswordUpdateDto })
  async patchPassword(
    @Req() req,
    @Param('id') id: string,
    @Body() body: PasswordUpdateDto,
  ) {
    if (req.user.id !== id) {
      throw new UnauthorizedException();
    }

    const user = await this.usersService.findById(id);
    if (!user) {
      throw new NotFoundException();
    }

    if (!(await this.usersService.checkCurrentPassword(user, body.password))) {
      throw new UnauthorizedException('현재 비밀번호가 일치하지 않습니다.');
    }

    await this.usersService.updatePasswordById(id, body.updatePassword);
  }

  @Post(':id/passwordcheck')
  @ApiOperation({
    summary: '현재 비밀번호 확인',
  })
  @ApiBody({ type: PasswordCheckDto })
  @ApiOkResponse({
    type: Boolean,
  })
  async checkCurrentPassword(
    @Req() req,
    @Param('id') id: string,
    @Body() body: PasswordCheckDto,
  ) {
    if (req.user.id !== id) {
      throw new UnauthorizedException();
    }

    const user = await this.usersService.findById(id);
    if (!user) {
      throw new NotFoundException();
    }

    return await this.usersService.checkCurrentPassword(user, body.password);
  }

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

    if (
      !req.user.isAdmin &&
      !(await this.usersService.checkCurrentPassword(user, body.password))
    ) {
      throw new UnauthorizedException('현재 비밀번호가 일치하지 않습니다.');
    }

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

  @Get('')
  @ApiOperation({
    summary: '회원 조회',
  })
  @ApiOkResponsePaginated(UserDto)
  async getUserList(@Query() query: GetUsersDto) {
    return await this.usersService.getPagingUsers(query);
  }

  @Post('')
  @ApiOperation({
    summary: '(ADMIN) 회원 생성',
    description: "국가코드는 default 'KR'로 생성됨.",
  })
  @ApiCreatedResponse({
    description: 'createdUserId',
  })
  async createUser(@Body() body: CreateUserDto) {
    if (await this.usersService.findOneByEmail(body.email)) {
      throw new ConflictException('Already exist email.');
    } else if (await this.usersService.existingNickname(body.nickname)) {
      throw new ConflictException('Already exist nickname.');
    }

    return this.usersService.createUserByAdmin(body);
  }
}
