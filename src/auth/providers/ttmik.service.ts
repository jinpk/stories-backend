import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import {
  TTMIK_API_PATH_RESET_PASSWORD,
  TTMIK_API_PATH_VALIDATE_PASSWORD,
  TTMIK_API_PATH_VERIFY,
  TTMIK_API_URL,
} from '../auth.constant';

@Injectable()
export class TTMIKService {
  constructor(private httpService: HttpService) {}

  async verifyEmail(adminToken: string, email: string): Promise<void> {
    const res = await this.httpService.axiosRef.post(
      `${TTMIK_API_URL}/${TTMIK_API_PATH_VERIFY}`,
      {
        email,
      },
      {
        headers: {
          Authorization: 'Bearer ' + adminToken,
        },
      },
    );

    if (res.status !== 200 && res.status !== 201) {
      console.error(
        'failed to verifiy email to ttmik system.: ',
        res.status,
        res.statusText,
        res.data,
      );
      throw new Error('TTMIK System 이메일 인증 변경 요청 실패 하였습니다.');
    }
  }

  async resetPassword(
    adminToken: string,
    email: string,
    newPassword: string,
  ): Promise<void> {
    const res = await this.httpService.axiosRef.post(
      `${TTMIK_API_URL}/${TTMIK_API_PATH_RESET_PASSWORD}`,
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

    if (res.status !== 200 && res.status !== 201) {
      console.error(
        'failed to reset password to ttmik system.: ',
        res.status,
        res.statusText,
        res.data,
      );
      throw new Error('TTMIK System 비밀번호 초기화 요청 실패 하였습니다.');
    }
  }

  async validatePassword(adminToken: string, email: string, password: string) {
    const res = await this.httpService.axiosRef.post(
      `${TTMIK_API_URL}/${TTMIK_API_PATH_VALIDATE_PASSWORD}`,
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

    if (res.status !== 200) {
      console.error(
        'failed to validate password to ttmik system.: ',
        res.status,
        res.statusText,
        res.data,
      );
      throw new Error('TTMIK System 비밀번호 검증 요청 실패 하였습니다.');
    }
  }
}
