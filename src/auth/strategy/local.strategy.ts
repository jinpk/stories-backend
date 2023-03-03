import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../auth.service';
import { AdminService } from 'src/admin/admin.service';


@Injectable()
export class LocalAdminStrategy extends PassportStrategy(
  Strategy,
  'local-admin',
) {
  constructor(private adminService: AdminService) {
    super();
  }

  async validate(username: string, password: string) {
    const sub = await this.adminService.validateAdmin(username, password);
    if (!sub) {
      throw new UnauthorizedException(
        '아이디와 비밀번호를 다시 확인해 주세요.',
      );
    }

    return sub;
  }
}
