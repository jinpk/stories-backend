import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AwsService } from 'src/aws/aws.service';
import { DynamicLinkActions } from 'src/common/enums';
import { FirebaseService } from 'src/common/providers';
import { User } from 'src/users/schemas/user.schema';
import { UsersService } from 'src/users/users.service';
import { ChangePasswordDto, PasswordResetQueryDto } from './dto';
import { TTMIKJwtPayload } from './interfaces';
import { TTMIKService } from './providers/ttmik.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private awsService: AwsService,
    private firebaseService: FirebaseService,
    private ttmikService: TTMIKService,
  ) {}

  async parseTTMIKToken(token: string): Promise<TTMIKJwtPayload> {
    const payload = await this.jwtService.verifyAsync(token, {
      secret: this.awsService.getParentJwtSecretKey,
    });
    return payload;
  }

  async genResetPasswordLink(email: string): Promise<string> {
    // 인증 JWT 생성
    const token = await this.jwtService.signAsync(
      { action: DynamicLinkActions.PasswordReset, email },
      { expiresIn: '30m' },
    );

    // DynamicLink Query 생성
    const rq = new PasswordResetQueryDto();
    rq.action = DynamicLinkActions.PasswordReset;
    rq.payload = token;

    // DynamicLink 생성
    const link = await this.firebaseService.generateDynamicLink(rq);
    return link;
  }

  async parsePasswordResetToken(token: string): Promise<string> {
    const payload = await this.jwtService.verifyAsync(token);
    if (payload?.action === DynamicLinkActions.PasswordReset) {
      return payload.email;
    }
  }

  async resetTTMIKPassword(email: string, password: string) {
    // ttmik system 요청에 필요한 admin token 생성
    const token = await this.jwtService.signAsync(
      { sub: -1, uid: -1 },
      {
        expiresIn: '30m',
        privateKey: this.awsService.getParentJwtSecretKey,
        secret: this.awsService.getParentJwtSecretKey,
      },
    );

    // 비밀번호 초기화 요청
    await this.ttmikService.resetPassword(token, email, password);
  }

  // @Service
  async changePassword(userId: string, dto: ChangePasswordDto) {
    // ttmik system 요청에 필요한 admin token 생성
    const token = await this.jwtService.signAsync(
      { sub: -1, uid: -1 },
      {
        expiresIn: '30m',
        privateKey: this.awsService.getParentJwtSecretKey,
        secret: this.awsService.getParentJwtSecretKey,
      },
    );

    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new NotFoundException('처리할 수 없는 계정입니다.');
    }

    // 기존 비밀번호 검증
    try {
      await this.ttmikService.validatePassword(token, user.email, dto.password);
    } catch (error) {
      console.error(error);
      throw new BadRequestException('현재 비밀번호가 일치하지 않습니다.');
    }

    // 초기화 요청
    await this.ttmikService.resetPassword(token, user.email, dto.newPassword);
  }

  async login(sub: string, isAdmin?: boolean) {
    const payload = { sub, isAdmin };
    return {
      accessToken: this.jwtService.sign(payload),
    };
  }

  async logout(sub: string, isAdmin?: boolean) {
    const payload = { sub, isAdmin };
    return {
      accessToken: this.jwtService.sign(payload),
    };
  }

  async signUp(payload: TTMIKJwtPayload, countryCode: string) {
    const user: User = {
      email: payload.email,
      countryCode,
      nickname: payload.name,
      newsletter: true,
    };
    const sub = await this.usersService.create(user);
    return this.login(sub);
  }
}
