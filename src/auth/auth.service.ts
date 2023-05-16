import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AwsService } from 'src/aws/aws.service';
import { DynamicLinkActions } from 'src/common/enums';
import { FirebaseService } from 'src/common/providers';
import { User } from 'src/users/schemas/user.schema';
import { UsersService } from 'src/users/users.service';
import { ChangePasswordDto, PasswordResetQueryDto } from './dto';
import { TTMIKJwtPayload } from './interfaces';
import { TTMIKService } from './providers/ttmik.service';
import { Auth, AuthDocument } from './schema/auth.schema';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private awsService: AwsService,
    private firebaseService: FirebaseService,
    private ttmikService: TTMIKService,
    @InjectModel(Auth.name) private authModel: Model<AuthDocument>,
  ) {}

  // TTMIK 시스템 연동 이메일 인증
  async forceVerifyEmail(email: string) {
    const auth = await this.authModel.findOne({
      used: false,
      verified: true,
      email,
    });
    if (!auth) {
      throw new ForbiddenException('invaild auth');
    }

    // admin token
    const token = await this.jwtService.signAsync(
      { sub: -1, uid: -1 },
      {
        expiresIn: '30m',
        privateKey: this.awsService.getParentJwtSecretKey,
        secret: this.awsService.getParentJwtSecretKey,
      },
    );

    // TTMIK로 이메일 강제 인증 요청
    try {
      await this.ttmikService.verifyEmail(token, email);
    } catch (error) {
      console.error('force verifiy email failed to ttmik');
      throw new UnprocessableEntityException(error);
    }

    auth.used = true;
    await auth.save();
  }

  // 이메일 인증 코드 row 생성
  async genEmailAuth(email: string): Promise<{ code: string; authId: string }> {
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    const doc = await new this.authModel({ email, code }).save();

    return { authId: doc._id.toHexString(), code };
  }

  // 이메일 인증 코드 검증
  async verifyEmailAuth(authId: string, code: string) {
    const auth = await this.authModel.findById(authId);
    if (!auth) {
      throw new NotFoundException();
    }
    if (auth.verified || auth.used) {
      throw new ForbiddenException();
    }
    if (code !== auth.code) {
      throw new UnprocessableEntityException();
    }

    auth.verified = true;
    await auth.save();
  }

  // TTMIK JWT 파싱
  async parseTTMIKToken(token: string): Promise<TTMIKJwtPayload> {
    const payload = await this.jwtService.verifyAsync(token, {
      secret: this.awsService.getParentJwtSecretKey,
    });
    return payload;
  }

  // 로그인 전 비밀번호 초기화 링크 생성
  // 사용자가 해당 링크 클릭했을때 담겨있는 token 값으로 서버에 검증 재요청 시나리오
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

  // 로그인 JWT 검증
  async parseToken(token: string): Promise<string> {
    const payload = await this.jwtService.verifyAsync(token);
    return payload.email;
  }

  // 비밀번호 초기화 메일에 담겨있는 JWT 검증
  async parsePasswordResetToken(token: string): Promise<string> {
    const payload = await this.jwtService.verifyAsync(token);
    if (payload?.action === DynamicLinkActions.PasswordReset) {
      return payload.email;
    }
  }

  // TTMIK 시스템 비밀번호 초기화 요청
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

  // TTMIK 시스템으로 비밀번호 재설정 변경 요청
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

    // TTMIK 기존 비밀번호 검증
    try {
      await this.ttmikService.validatePassword(token, user.email, dto.password);
    } catch (error) {
      console.error(JSON.stringify(error));
      throw new BadRequestException('현재 비밀번호가 일치하지 않습니다.');
    }

    // TTMIK 초기화 요청
    try {
      await this.ttmikService.resetPassword(token, user.email, dto.newPassword);
    } catch (error) {
      console.error(JSON.stringify(error));
      throw new BadRequestException('비밀번호 초기화 요청 실패');
    }
  }

  // SUB로 로그인 JWT 생성
  async login(sub: string, isAdmin?: boolean) {
    const payload = { sub, isAdmin };
    return {
      accessToken: this.jwtService.sign(payload, { expiresIn: '30d' }),
    };
  }

  // 사용자 회원가입 요청
  async signUp(payload: TTMIKJwtPayload, countryCode: string) {
    const user: User = {
      email: payload.email,
      nickname: payload.name,
      ttmik: payload.isPremium,
      countryCode,
      newsletter: true,
    };
    const sub = await this.usersService.create(user);
    return this.login(sub);
  }
}
