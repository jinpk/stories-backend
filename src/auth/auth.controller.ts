import {
  Body,
  ConflictException,
  Controller,
  Get,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiBody, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UsersService } from 'src/users/users.service';
import { AuthService } from './auth.service';
import { LoginDto, LoginResDto, SignUpDto } from './dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { LocalAuthGuard } from './local-auth.guard';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private usersService: UsersService,
  ) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  @ApiOperation({
    summary: '이메일 로그인',
  })
  @ApiBody({
    type: LoginDto,
  })
  @ApiOkResponse({
    type: LoginResDto,
  })
  async login(@Request() req) {
    return this.authService.login(req.user);
  }

  @Post('signup')
  @ApiOperation({
    summary: '회원가입',
  })
  @ApiBody({
    type: SignUpDto,
  })
  @ApiOkResponse({
    type: LoginResDto,
  })
  async signUp(@Body() body: SignUpDto) {
    if (await this.usersService.findOneByEmail(body.email)) {
      throw new ConflictException('Already exist email.');
    }

    return this.authService.signUp(body);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  @ApiOperation({
    summary: '내 정보 조회',
  })
  async getMe(@Request() req) {
    console.log(req);
    return null;
  }
}
