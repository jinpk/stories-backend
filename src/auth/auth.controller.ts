import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Post,
  Request,
  UseGuards,
  UnauthorizedException,
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
} from './dto';
import { LocalAuthAdminGuard } from './guard/local-auth.guard';
import { AdminService } from 'src/admin/admin.service';
import { TTMIKJwtPayload } from './interfaces';
import { FirebaseService } from 'src/firebase/firebase.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  PasswordResetedEvent,
  PasswordResetEvent,
} from './events/password-reset.event';

@Controller('auth')
@ApiTags('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private usersService: UsersService,
    private adminService: AdminService,
    private firebaseService: FirebaseService,
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

  @Post('login')
  @Public()
  @ApiOperation({
    summary: 'TTMIK 로그인',
    description: `**본 서비스는 TTMIK 회원과 미러링 됨.**
    \n\nTTMIK 로그인 시스템에서 발급 받은 JWT_TOKEN으로 요청.
    \n* 스토리즈앱에 가입한적 있다면 로그인후 스토리즈앱 로그인 JWT_TOKEN 발급
    \n* 가입한적 없다면 자동 가입 처리후 로그인 JWT_TOKEN 발급
    \n* countryCode는 Device에서 받아와 항상 요청 필요`,
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
  async ttmkiLogin(@Body('token') token, @Body('countryCode') countryCode) {
    let payload: TTMIKJwtPayload;
    try {
      payload = await this.authService.parseTTMIKToken(token);
    } catch (error) {
      throw new UnauthorizedException('Invalid TTMIK Jwt Token.');
    }

    const user = await this.usersService.findOneByEmailAll(payload.email);

    if (!user) {
      return await this.authService.signUp(payload, countryCode);
    }

    if (user.deleted) {
      throw new UnauthorizedException('User Already deleted.');
    }

    return await this.authService.login(user._id.toHexString(), false);
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

    if (!(await this.usersService.findOneByEmail(email))) {
      throw new NotFoundException('Not found email.');
    }

    await this.usersService.updatePasswordByEmail(email, body.password);

    this.eventEmitter.emit(
      PasswordResetedEvent.event,
      new PasswordResetedEvent(email),
    );
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
    if (!(await this.usersService.findOneByEmail(email))) {
      throw new NotFoundException('Not found email.');
    }
    // 인증 JWT 생성
    const token = await this.authService.genResetPasswordJWT(email);

    // DynamicLink Query 생성
    const rq = new PasswordResetQueryDto();
    rq.action = 'passwordreset';
    rq.payload = token;

    // DynamicLink 생성
    const link = await this.firebaseService.generateDynamicLink(rq);

    this.eventEmitter.emit(
      PasswordResetEvent.event,
      new PasswordResetEvent(email, link),
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
