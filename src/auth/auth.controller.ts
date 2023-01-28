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
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
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
} from './dto';
import { LocalAuthGuard, LocalAuthAdminGuard } from './guard/local-auth.guard';
import { AdminService } from 'src/admin/admin.service';
import { ExistUserDto } from './dto/exist-user.dto';
import { isEmail, ValidationError } from 'class-validator';

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

  @Post('login')
  @Public()
  @UseGuards(LocalAuthGuard)
  @ApiOperation({
    summary: '사용자 이메일 로그인',
  })
  @ApiBody({
    type: LoginDto,
  })
  @ApiOkResponse({
    type: TokenDto,
  })
  async login(@Request() req) {
    return this.authService.login(req.user);
  }

  @Post('oauth')
  @Public()
  @ApiOperation({
    summary: 'OAuth 로그인 / 자동가입',
  })
  @ApiOkResponse({
    type: TokenDto,
  })
  async oAuth(@Body() body: OAuthDto) {
    throw new Error('개발중인 컨트롤러');
    return this.authService.login('wd');
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

  @Post('verifi')
  @Public()
  @ApiOperation({
    summary: '회원가입 이메일 인증 요청',
    description: `1. 이메일 인증 요청후 tokenId 발급
    \n2. tokenId로 이메일 인증코드 검증
    \n3. tokenId로 회원가입 요청`,
  })
  @ApiBody({
    schema: {
      properties: {
        email: { type: 'string', description: '이메일' },
      },
    },
  })
  @ApiOkResponse({
    description: 'verifiId',
    schema: {
      type: 'string',
    },
  })
  async emailVerify(@Body('email') email: string) {
    if (!isEmail(email)) {
      throw new BadRequestException(
        '올바른 형식의 이메일 주소를 입력해 주세요.',
      );
    } else if (await this.usersService.findOneByEmail(email)) {
      throw new ConflictException('Already exist email.');
    }
    return await this.authService.requestEmailVerify(email);
  }

  @Post('verifi/:verifiId')
  @Public()
  @ApiOperation({
    summary: '코드 인증',
  })
  @ApiBody({
    schema: {
      properties: {
        code: { type: 'string', description: '인증코드' },
      },
    },
  })
  @ApiOkResponse({
    type: Boolean,
    description: '인증완료:true | 인증실패: false | 오류: Excepction',
  })
  async emailVerifyCode(
    @Body('code') code: string,
    @Param('verifiId') verifiId: string,
  ) {
    if (!code || !verifiId) {
      throw new BadRequestException('code or verifiId is empty string.');
    }
    return await this.authService.verifyEmailCode(verifiId, code);
  }

  @Post('signup')
  @Public()
  @ApiOperation({
    summary: '회원가입',
  })
  @ApiBody({
    type: SignUpDto,
  })
  @ApiOkResponse({
    type: TokenDto,
  })
  async signUp(@Body() body: SignUpDto) {
    const verifi = await this.authService.parseVerifyId(body.verifiId);
    if (await this.usersService.findOneByEmail(verifi.email)) {
      throw new ConflictException('Already exist email.');
    } else if (await this.usersService.existingNickname(body.nickname)) {
      throw new ConflictException('Already exist nickname.');
    }

    return this.authService.signUp(verifi, body);
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
  async passwordResetExecute(@Body() body: PasswordResetDto) {}

  @Post('passwordreset')
  @Public()
  @ApiOperation({
    summary: '비밀번호 재설정 요청',
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
