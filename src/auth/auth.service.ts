import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from 'src/users/schemas/user.schema';
import { UsersService } from 'src/users/users.service';
import { SignUpDto } from './dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string) {
    const user = await this.usersService.findOneByEmail(email);
    if (user && user.password === password) {
      return user._id.toString();
    }
    return null;
  }

  async login(sub: string) {
    const payload = { sub };
    return {
      accessToken: this.jwtService.sign(payload),
    };
  }

  async signUp(params: SignUpDto) {
    const user: User = {
      email: params.email,
      password: params.password,
      name: 'name ' + new Date().getTime(),
      nickname: 'name ' + new Date().getTime(),
      subNewsletter: false,
      countryCode: 'kr',
      ttmik: false,
      deleted: false,
    };

    const sub = await this.usersService.create(user);

    return this.login(sub);
  }
}
