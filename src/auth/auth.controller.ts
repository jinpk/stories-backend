import {
  Body,
  ConflictException,
  Controller,
  Get,
  NotFoundException,
  Post,
  Request,
  UseGuards,
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
  LoginDto,
  TokenDto,
  SignUpDto,
  AdminLoginDto,
} from './dto';
import { LocalAuthGuard, LocalAuthAdminGuard } from './guard/local-auth.guard';
import { AdminService } from 'src/admin/admin.service';

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
    summary: '사용자 로그인',
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

  @Post('signup')
  @Public()
  @ApiOperation({
    summary: '회원가입 (관리자 계정생성)',
  })
  @ApiBody({
    type: SignUpDto,
  })
  @ApiOkResponse({
    type: TokenDto,
  })
  async signUp(@Body() body: SignUpDto) {
    if (await this.usersService.findOneByEmail(body.email)) {
      throw new ConflictException('Already exist email.');
    }

    return this.authService.signUp(body);
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
