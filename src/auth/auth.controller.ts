import {
  Body,
  ConflictException,
  Controller,
  Get,
  NotFoundException,
  Post,
  Request,
  Query,
  UseGuards,
  BadRequestException,
  Param,
  UnauthorizedException,
  Header,
  Headers,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiHeader,
  ApiOkResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { UsersService } from 'src/users/users.service';
import { Public } from './decorator/auth.decorator';
import { AuthService } from './auth.service';
import {
  AccountDto,
  LoginDto,
  TokenDto,
  SignUpDto,
  AdminLoginDto,
  PasswordResetDto,
  OAuthDto,
  ExistUserDto,
} from './dto';
import { LocalAuthGuard, LocalAuthAdminGuard } from './guard/local-auth.guard';
import { AdminService } from 'src/admin/admin.service';
import { isEmail } from 'class-validator';
import { TTMIKJwtPayload } from './interfaces';

@Controller('auth')
@ApiTags('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private usersService: UsersService,
    private adminService: AdminService,
  ) {}

  @Post('admin/login')
  @Public()
  @UseGuards(LocalAuthAdminGuard)
  @ApiOperation({
    summary: '관리자 로그인',
  })
  @ApiBody({
    type: AdminLoginDto,
  })
  @ApiOkResponse({
    type: TokenDto,
  })
  async adminLogin(@Request() req) {
    return this.authService.login(req.user, true);
  }

  @Post('logout')
  @ApiBearerAuth()
  @ApiOperation({
    summary: '사용자 로그아웃',
    description: `로그아웃시 Client에서 accessToken 삭제
    \n서버에서는 FcmToken 초기화`,
  })
  async logout(@Request() req) {
    await this.usersService.updateById(req.user.id, { fcmToken: '' });
  }

  @Post('login')
  @Public()
  @ApiOperation({
    summary: 'TTMIK 로그인',
    description: `**본 서비스는 TTMIK 회원과 미러링 됨.**
    \n\nTTMIK 로그인 시스템에서 발급 받은 JWT_TOKEN으로 요청.
    \n* 스토리즈앱에 가입한적 있다면 로그인후 스토리즈앱 로그인 JWT_TOKEN 발급
    \n* 가입한적 없다면 자동 가입 처리후 로그인 JWT_TOKEN 발급`,
  })
  @ApiOkResponse({
    type: TokenDto,
  })
  @ApiBody({
    schema: {
      description: 'token: TTMIK_JWT_TOKEN',
      required: ['token'],
      properties: { token: { type: 'string' } },
    },
  })
  async ttmkiLogin(@Body('token') token) {
    let payload: TTMIKJwtPayload;
    try {
      payload = await this.authService.parseTTMIKToken(token);
    } catch (error) {
      throw new UnauthorizedException('Invalid TTMIK Jwt Token.');
    }

    console.log(payload);
  }

  @Get('users/exist')
  @Public()
  @ApiOperation({
    summary: '회원 존재여부 조회 (Public)',
  })
  @ApiResponse({ description: '존재하면 true' })
  async existUser(@Query() query: ExistUserDto) {
    return await this.usersService.getExistingUser(query);
  }

  @Post('passwordreset/exec')
  @Public()
  @ApiOperation({
    summary: '비밀번호 재설정',
  })
  @ApiBody({
    type: PasswordResetDto,
  })
  @ApiOkResponse({
    description: '비밀번호 재설정 완료',
  })
  async passwordResetExecute(@Body() body: PasswordResetDto) {
    const email = await this.authService.verifyPasswordResetToken(body.token);
    if (!email) {
      throw new UnauthorizedException('유효하지 않거나 만료된 토큰입니다.');
    }

    if (!(await this.usersService.findOneByEmail(email))) {
      throw new NotFoundException('not found email.');
    }

    await this.usersService.updatePasswordByEmail(email, body.password);
  }

  @Post('passwordreset')
  @Public()
  @ApiOperation({
    summary: '비밀번호 재설정 요청',
    description: '이메일로 링크에 토큰담아서 전송됨.',
  })
  @ApiBody({
    schema: {
      properties: { email: { type: 'string' } },
    },
  })
  @ApiOkResponse({
    description: '이메일 링크 query.token에 값 전송',
  })
  async passwordReset(@Body('email') email: string) {
    if (!(await this.usersService.findOneByEmail(email))) {
      throw new NotFoundException('not found email.');
    }

    return await this.authService.requestPasswordResetEmail(email);
  }

  @Get('me')
  @ApiBearerAuth()
  @ApiOperation({
    summary: '로그인 정보 조회',
  })
  @ApiOkResponse({
    type: AccountDto,
  })
  async getMe(@Request() req) {
    const account: AccountDto = {
      id: req.user.id,
      email: '',
      isAdmin: req.user.isAdmin || false,
    };

    if (account.isAdmin) {
      const admin = await this.adminService.findById(account.id);
      if (!admin) {
        throw new NotFoundException('조회할 수 없는 관리자 계정입니다.');
      }
    } else {
      const user = await this.usersService.findById(account.id);
      if (!user) {
        throw new NotFoundException('조회할 수 없는 계정입니다.');
      }
      account.email = user.email;
    }

    return account;
  }
}
