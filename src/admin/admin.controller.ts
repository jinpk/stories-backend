import { Body, ConflictException, Controller, Post } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { UsersService } from 'src/users/users.service';
import { AdminService } from './admin.service';
import { CreateUserDto } from './dto/users.dto';

@Controller('admin')
@ApiTags('admin')
@ApiBearerAuth()
export class AdminController {
  constructor(
    private adminService: AdminService,
    private usersService: UsersService,
  ) {}

  @Post('users')
  @ApiOperation({
    summary: '사용자 생성',
    description: "국가코드는 default 'KR'로 생성됨.",
  })
  @ApiCreatedResponse({
    description: 'createdUserId',
  })
  async signUp(@Body() body: CreateUserDto) {
    if (await this.usersService.findOneByEmail(body.email)) {
      throw new ConflictException('Already exist email.');
    } else if (await this.usersService.existingNickname(body.nickname)) {
      throw new ConflictException('Already exist nickname.');
    }

    return this.adminService.createUser(body);
  }
}
