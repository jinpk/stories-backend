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
import { AccountDto, LoginDto, TokenDto, SignUpDto } from './dto';
import { LocalAuthGuard } from './guard/local-auth.guard';

@Controller('auth')
@ApiTags('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private usersService: UsersService,
  ) {}

  @Post('login')
  @Public()
  @UseGuards(LocalAuthGuard)
  @ApiOperation({
    summary: '이메일 로그인',
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
    summary: '회원가입 (계정생성)',
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
      isAdmin: req.user.isAdmin,
    };

    const user = await this.usersService.findById(account.id);
    if (!user) {
      throw new NotFoundException('조회할 수 없는 계정입니다.');
    }

    account.email = user.email;

    return account;
  }
}
