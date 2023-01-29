import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from 'src/users/schemas/user.schema';
import { UsersService } from 'src/users/users.service';
import { OAuthDto, SignUpDto } from './dto';
import { OAuthProviers } from './enums';
import { OAuthResult } from './interfaces';
import { OAuthService } from './oauth.service';
import { Verifi, VerifiDocument } from './schemas/verifi.schema';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(Verifi.name) private verifiModel: Model<VerifiDocument>,
    private usersService: UsersService,
    private jwtService: JwtService,
    private oAuthService: OAuthService,
  ) {}

  async oAuthLogin(body: OAuthDto) {
    let result: OAuthResult;
    switch (body.provider) {
      case OAuthProviers.Facebook:
        result = await this.oAuthService.decodeFacebook(body.code);
        break;
      case OAuthProviers.Google:
        result = await this.oAuthService.decodeGoogle(body.code);
        break;
      case OAuthProviers.Apple:
        result = await this.oAuthService.decodeApple(body.code);
        break;
    }

    const doc = await this.usersService.findByOAuthId(
      result.provider,
      result.id,
    );

    if (!doc) {
      const user: User = {
        email: '',
        password: '',
        name: result.name,
        nickname: result.name,
        subNewsletter: false,
        countryCode: body.countryCode || 'KR',
        ttmik: false,
        deleted: false,
      };

      if (
        result.email &&
        !(await this.usersService.findOneByEmail(result.email))
      ) {
        user.email = result.email;
      }

      let count = 0;
      let nicknameUnChecked = true;
      while (nicknameUnChecked) {
        count++;
        nicknameUnChecked = await this.usersService.existingNickname(user.name);
        if (nicknameUnChecked) {
          user.name = user.name + count;
        }
      }

      const sub = await this.usersService.create(user);
      return this.login(sub);
    }

    return this.login(doc._id.toString());
  }

  async parseVerifyId(verifiId: string) {
    const verifi = await this.verifiModel.findById(verifiId);
    if (!verifi || !verifi.verified) {
      throw new Error('Invalid verifiId');
    }

    return verifi;
  }

  async verifyEmailCode(verifiId: string, code: string) {
    const verifi = await this.verifiModel.findById(verifiId);
    if (!verifi || verifi.verified) {
      throw new Error('잘못된 접근입니다.');
    }
    if (verifi.code !== code) {
      return false;
    }

    verifi.verified = true;
    await verifi.save();
    return true;
  }

  async requestPasswordResetEmail(email: string) {
    //토큰 이메일 전송 필요
    return await this.jwtService.signAsync(
      { action: 'password', email },
      { expiresIn: '30m' },
    );
  }

  async verifyPasswordResetToken(token: string) {
    const payload = await this.jwtService.verifyAsync(token);
    if (payload?.action === 'password') {
      return payload.email;
    }
    return null;
  }

  async requestEmailVerify(email: string) {
    const code = Math.floor(100000 + Math.random() * 900000);
    const doc = await new this.verifiModel({
      email,
      code,
    }).save();

    //이메일 전송 - 이메일 전송이 필수, 이벤트기반 X
    return { verifiId: doc._id.toString(), code };
  }

  async validateUser(email: string, password: string) {
    const user = await this.usersService.findOneByEmail(email);
    if (user && (await user.comparePassword(password))) {
      return user._id.toString();
    }
    return null;
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

  async signUp(verifi: VerifiDocument, params: SignUpDto) {
    const user: User = {
      email: verifi.email,
      password: params.password,
      name: params.nickname,
      nickname: params.nickname,
      subNewsletter: false,
      countryCode: params.countryCode || 'KR',
      ttmik: false,
      deleted: false,
    };

    const sub = await this.usersService.create(user);
    await verifi.delete();
    return this.login(sub);
  }
}
