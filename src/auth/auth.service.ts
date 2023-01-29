import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from 'src/users/schemas/user.schema';
import { UsersService } from 'src/users/users.service';
import { SignUpDto } from './dto';
import { Verifi, VerifiDocument } from './schemas/verifi.schema';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(Verifi.name) private verifiModel: Model<VerifiDocument>,
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

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

  async requestEmailVerify(email: string) {
    const code = Math.floor(100000 + Math.random() * 900000);
    const doc = await new this.verifiModel({
      email,
      code,
    }).save();
    return doc._id.toString();
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
