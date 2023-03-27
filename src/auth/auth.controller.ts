import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Post,
  Request,
  UseGuards,
  UnauthorizedException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiConflictResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnprocessableEntityResponse,
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
  EmailVerificationReqeust,
  EmailVerificationConfirmReqeust,
  TTMIKLoginDto,
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

  @Post('email/verification/code')
  @Public()
  @ApiOperation({
    summary: '이메일 인증 요청 & 코드 전송',
    description: `TTMIK 회원가입전 stories database에 이메일 인증을미리 하는 API.
    \nttmik 시스템 회원가입 전 미리 인증하여 업데이트함.`,
  })
  @ApiBody({
    type: EmailVerificationReqeust,
  })
  @ApiOkResponse({ type: String, description: 'authId' })
  @ApiConflictResponse({ description: '이미 stories에 가입된 회원이라면' })
  async verifyEmail(@Body() body: EmailVerificationReqeust) {
    const user = await this.usersService.getActiveUserByEmail(body.email);
    if (user) {
      throw new ConflictException();
    }

    const { authId, code } = await this.authService.genEmailAuth(body.email);

    this.eventEmitter.emit(
      VerifyEmailEvent.event,
      new VerifyEmailEvent(body.email, code),
    );

    return authId;
  }

  @Post('email/verification')
  @Public()
  @ApiOperation({
    summary: '이메일 인증 확인',
    description:
      '사용자 이메일 인증버튼 클릭시 호출되는 GET API\n성공하면 TTMIK 회원가입 진행하고 Stories JWT 로그인 진행하면 됩니다.',
  })
  @ApiBody({ type: EmailVerificationConfirmReqeust })
  @ApiOkResponse({ description: '인증완료. 해당 이메일로 회원가입하면 됨.' })
  @ApiNotFoundResponse({ description: '인증 요청을 먼저해 주세요.' })
  @ApiForbiddenResponse({ description: '이미 인증 되었거나 회원가입된 인증건' })
  @ApiUnprocessableEntityResponse({ description: '코드가 일치하지 않을 경우' })
  async verifyEmailCheck(@Body() body: EmailVerificationConfirmReqeust) {
    await this.authService.verifyEmailAuth(body.authId, body.code);
  }

  @Post('login')
  @Public()
  @ApiOperation({
    summary: 'TTMIK 로그인',
    description: `**본 서비스는 TTMIK 회원과 미러링 됨.**
    \n\n TTMIK 로그인 시스템에서 발급 받은 JWT_TOKEN으로 요청.
    \n* countryCode는 Device에서 받아와 항상 요청 필요
    \n* 이메일 인증을 꼭 미리하고 TTMIK 회원가입 > Stories 로그인 요청하여 Stories 회원가입 필요.
    \n* 스토리즈에서 미리 이메일 인증을하고 TTMIK에 가입하면
    \n* TTMIK JWT Payload의 email을 읽어와서 자동으로 이메일 인증요청 API를 호출합니다.
    \n* 처음 인증하는 경우 이메일 인증을하고 JWT응답을 바로해 주지만 
    \n다음 로그인시 TTMIK 토큰을 새로 발급받아서 요청해야 TTMIK JWT.payload.isVerify가 업데이트 되어있습니다.
    `,
  })
  @ApiOkResponse({
    type: TokenDto,
  })
  @ApiBody({
    type: TTMIKLoginDto,
  })
  @ApiForbiddenResponse({
    description: `- TTMIK JWT 검증하지 못한 경우\n
      - TTMIK 회원가입전 이메일 인증을 안한 경우\n
      - TTMIK JWT Payload에 이메일이 없는 경우`,
  })
  @ApiUnprocessableEntityResponse({
    description: `- TTMIK 시스템으로 이메일 인증 요청 실패한 경우`,
  })
  @ApiBadRequestResponse({ description: 'TTMIK token이 유효하지 않은 경우' })
  async ttmkiLogin(
    @Body() { token, countryCode }: TTMIKLoginDto,
  ): Promise<TokenDto> {
    let payload: TTMIKJwtPayload;
    try {
      payload = await this.authService.parseTTMIKToken(token);
      if (!payload.email) {
        throw new ForbiddenException('TTMIK JWT에 email이 없습니다.');
      }
    } catch (error) {
      throw new ForbiddenException('Invalid TTMIK Jwt Token.');
    }

    if (payload.referer === 'ttmik-stories' && !payload.isVerify) {
      // 기존에 인증했을걸 가져와서 인증 처리
      await this.authService.forceVerifyEmail(payload.email);
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

    return tokenResponse;
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
