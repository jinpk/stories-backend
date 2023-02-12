import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AwsService } from 'src/aws/aws.service';
import { User } from 'src/users/schemas/user.schema';
import { UsersService } from 'src/users/users.service';
import { TTMIKJwtPayload } from './interfaces';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private awsService: AwsService,
  ) {}

  async parseTTMIKToken(token: string): Promise<TTMIKJwtPayload> {
    const payload = await this.jwtService.verifyAsync(token, {
      secret: this.awsService.getParentJwtSecretKey,
    });
    return payload;
  }

  async genResetPasswordJWT(email: string) {
    const token = await this.jwtService.signAsync(
      { action: 'passwordreset', email },
      { expiresIn: '30m' },
    );

    return token;
  }

  async parsePasswordResetToken(token: string): Promise<string> {
    const payload = await this.jwtService.verifyAsync(token);
    if (payload?.action === 'passwordreset') {
      return payload.email;
    }
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
