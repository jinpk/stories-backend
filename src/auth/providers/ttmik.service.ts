import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import {
  TTMIK_API_PATH_RESET_PASSWORD,
  TTMIK_API_PATH_VALIDATE_PASSWORD,
  TTMIK_API_PATH_VERIFY,
  TTMIK_API_URL,
} from '../auth.constant';

// TTMIK 연동 서비스
@Injectable()
export class TTMIKService {
  constructor(private httpService: HttpService) {}

  // TTMIK로 이메일 인증 상태 변경 요청
  async verifyEmail(adminToken: string, email: string): Promise<void> {
    const res = await this.httpService.axiosRef.post(
      `${TTMIK_API_URL}${TTMIK_API_PATH_VERIFY}`,
      {
        email,
      },
      {
        headers: {
          Authorization: 'Bearer ' + adminToken,
        },
      },
    );

    console.log('verifyEmail', JSON.stringify(res.data));
  }

  // TTMIK로 비밀번호 초기화 요청
  async resetPassword(
    adminToken: string,
    email: string,
    newPassword: string,
  ): Promise<void> {
    const res = await this.httpService.axiosRef.post(
      `${TTMIK_API_URL}${TTMIK_API_PATH_RESET_PASSWORD}`,
      {
        email,
        new_password: newPassword,
      },
      {
        headers: {
          Authorization: 'Bearer ' + adminToken,
        },
      },
    );

    console.log('resetPassword', JSON.stringify(res.data));
  }

  // TTMIK로 이전 비밀번호 검증 확인 요청
  async validatePassword(adminToken: string, email: string, password: string) {
    const res = await this.httpService.axiosRef.post(
      `${TTMIK_API_URL}${TTMIK_API_PATH_VALIDATE_PASSWORD}`,
      {
        email,
        password,
      },
      {
        headers: {
          Authorization: 'Bearer ' + adminToken,
        },
      },
    );

    console.log('validatePassword', JSON.stringify(res.data));
  }
}
