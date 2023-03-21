import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Post,
  Request,
  UseGuards,
  UnauthorizedException,
  BadRequestException,
  NotAcceptableException,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { UsersService } from 'src/users/users.service';
import { Public } from './decorator/auth.decorator';
import { AuthService } from './auth.service';
import {
  AccountDto,
  TokenDto,
  AdminLoginDto,
  PasswordResetDto,
  PasswordResetQueryDto,
  ChangePasswordDto,
  LoginResponseDto,
} from './dto';
import { LocalAuthAdminGuard } from './guard/local-auth.guard';
import { AdminService } from 'src/admin/admin.service';
import { TTMIKJwtPayload } from './interfaces';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  PasswordResetedEvent,
  PasswordResetEvent,
} from './events/password-reset.event';
import { VerifyEmailEvent } from './events/verify-email.event';

@Controller('auth')
@ApiTags('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private usersService: UsersService,
    private adminService: AdminService,
    private eventEmitter: EventEmitter2,
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

  @Get('email/verification')
  @Public()
  @ApiOperation({
    summary: '이메일 인증 확인',
    description: '사용자 이메일 인증버튼 클릭시 호출되는 GET API',
  })
  async verifyEmailCheck(@Query('token') token: string) {
    let email = '';
    try {
      email = await this.authService.parseToken(token);
    } catch (error) {
      throw new UnauthorizedException('invalid token');
    }

    await this.authService.forceVerifyEmail(email);

    return `<h1>Succefuly verified. please login again!</h1>`;
  }

  @Post('email/verification')
  @Public()
  @ApiOperation({
    summary: '이메일 인증 요청',
    description: `로그인에서 verification: false회원만 API 요청 가능 body.token은 TTMIK API에서 로그인후 발급받은 JWT입니다.\n사용자가 30분 이내 이메일의 인증 버튼을 클릭하면 자동으로 처리됩니다.`,
  })
  @ApiBody({
    schema: {
      description: 'token: TTMIK_JWT_TOKEN',
      required: ['token'],
      properties: {
        token: { type: 'string' },
      },
    },
  })
  async verifyEmail(@Body('token') token) {
    let payload: TTMIKJwtPayload;
    try {
      payload = await this.authService.parseTTMIKToken(token);
    } catch (error) {
      throw new UnauthorizedException('Invalid TTMIK Jwt Token.');
    }

    if (!payload.email) {
      throw new BadRequestException('TTMIK JWT에 email이 없습니다.');
    } else if (payload.referer !== 'ttmik-stories') {
      throw new BadRequestException('referer "ttmik-stories" 회원이 아닙니다.');
    } else if (payload.isVerify) {
      throw new NotAcceptableException('이미 인증된 회원입니다.');
    }

    const link = await this.authService.genEmailAuthLink(payload.email);

    this.eventEmitter.emit(
      VerifyEmailEvent.event,
      new VerifyEmailEvent(payload.email, link),
    );
  }

  @Post('login')
  @Public()
  @ApiOperation({
    summary: 'TTMIK 로그인',
    description: `**본 서비스는 TTMIK 회원과 미러링 됨.**
    \n\nTTMIK 로그인 시스템에서 발급 받은 JWT_TOKEN으로 요청.
    \n* 스토리즈앱에 가입한적 있다면 로그인후 스토리즈앱 로그인 JWT_TOKEN 발급
    \n* 가입한적 없다면 자동 가입 처리후 로그인 JWT_TOKEN 발급
    \n* countryCode는 Device에서 받아와 항상 요청 필요
    \n
    \n
    이메일 인증하지 않은 회원은 verification: false로 내려가니 체크하여 이메일 인증 전송 API 호출하여 이메일 인증하고 다시 로그인 필요
    `,
  })
  @ApiOkResponse({
    type: TokenDto,
  })
  @ApiBody({
    schema: {
      description: 'token: TTMIK_JWT_TOKEN',
      required: ['token', 'countryCode'],
      properties: {
        token: { type: 'string' },
        countryCode: { type: 'string', description: 'Device CountryCode' },
      },
    },
  })
  async ttmkiLogin(
    @Body('token') token,
    @Body('countryCode') countryCode,
  ): Promise<LoginResponseDto> {
    let payload: TTMIKJwtPayload;
    try {
      payload = await this.authService.parseTTMIKToken(token);
    } catch (error) {
      throw new UnauthorizedException('Invalid TTMIK Jwt Token.');
    }

    if (!payload.email) {
      throw new BadRequestException('TTMIK JWT에 email이 없습니다.');
    }

    if (payload.referer === 'ttmik-stories' && !payload.isVerify) {
      return { verification: false, accessToken: '' };
    }

    const user = await this.usersService.findOneByEmail(payload.email);

    let tokenResponse: TokenDto = { accessToken: '' };
    if (!user) {
      tokenResponse = await this.authService.signUp(payload, countryCode);
    } else {
      tokenResponse = await this.authService.login(
        user._id.toHexString(),
        false,
      );
    }

    return {
      accessToken: tokenResponse.accessToken,
      verification: true,
    };
  }

  @Post('passwordchange')
  @ApiBearerAuth()
  @ApiOperation({
    summary: '사용자 비밀번호 변경',
    description: '로그인된 회원이 비밀번호 변경 요청한 경우',
  })
  async changePassword(@Request() req, @Body() body: ChangePasswordDto) {
    await this.authService.changePassword(req.user.id, body);
  }

  @Post('passwordreset/exec')
  @Public()
  @ApiOperation({
    summary: '비밀번호 재설정',
    description:
      '이메일 링크의 FirebaseDynamicLink의 query.payload에 담긴 JWT와 재설정할 비밀번호로 요청\nToken 만료기한: 30분',
  })
  @ApiOkResponse({
    description: '비밀번호 재설정 완료',
  })
  async passwordResetExecute(@Body() body: PasswordResetDto) {
    const email = await this.authService.parsePasswordResetToken(body.token);
    if (!email) {
      throw new UnauthorizedException('유효하지 않거나 만료된 토큰입니다.');
    }

    const user = await this.usersService.findOneByEmail(email);
    if (!user) {
      throw new NotFoundException('Not found email.');
    }

    await this.authService.resetTTMIKPassword(email, body.password);

    this.authService.genResetPasswordLink(email).then((link) => {
      this.eventEmitter.emit(
        PasswordResetedEvent.event,
        new PasswordResetedEvent(email, user.nickname, link),
      );
    });
  }

  @Post('passwordreset')
  @Public()
  @ApiOperation({
    summary: '비밀번호 재설정 링크 이메일 요청',
    description:
      '이메일의 링크 클릭시 Firebase InApp DeepLinking 처리\nDeepLink의 Query Spec은 Response 확인필요',
  })
  @ApiBody({
    schema: {
      properties: { email: { type: 'string' } },
    },
  })
  @ApiOkResponse({
    description: 'Firebase Dynamic Link의 URL Query Spec',
    type: PasswordResetQueryDto,
  })
  async passwordReset(@Body('email') email: string) {
    const user = await this.usersService.findOneByEmail(email);
    if (!user) {
      throw new NotFoundException('Not found email.');
    }

    const link = await this.authService.genResetPasswordLink(email);

    this.eventEmitter.emit(
      PasswordResetEvent.event,
      new PasswordResetEvent(email, user.nickname, link),
    );
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
