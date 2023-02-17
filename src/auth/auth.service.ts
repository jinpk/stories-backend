import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AwsService } from 'src/aws/aws.service';
import { DynamicLinkActions } from 'src/common/enums';
import { FirebaseService } from 'src/common/providers';
import { User } from 'src/users/schemas/user.schema';
import { UsersService } from 'src/users/users.service';
import { PasswordResetQueryDto } from './dto';
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
    const token = await this.jwtService.signAsync(
      { sub: -1, uid: -1 },
      {
        expiresIn: '30m',
        privateKey: this.awsService.getParentJwtSecretKey,
        secret: this.awsService.getParentJwtSecretKey,
      },
    );

    await this.ttmikService.resetPassword(token, email, password);
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
    };
    const sub = await this.usersService.create(user);
    return this.login(sub);
  }
}
