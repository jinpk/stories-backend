import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import {
  TTMIK_API_PATH_CHANGE_PASSWORD,
  TTMIK_API_PATH_RESET_PASSWORD,
  TTMIK_API_URL,
} from '../auth.constant';

@Injectable()
export class TTMIKService {
  constructor(private httpService: HttpService) {}

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
          Authorization: adminToken,
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

  async changePassword(
    userToken: string,
    password: string,
    newPassword: string,
  ) {
    const res = await this.httpService.axiosRef.post(
      `${TTMIK_API_URL}/${TTMIK_API_PATH_CHANGE_PASSWORD}`,
      {
        password,
        new_password: newPassword,
      },
      {
        headers: {
          Authorization: userToken,
        },
      },
    );

    if (res.status !== 200 && res.status !== 201) {
      console.error(
        'failed to chnage password to ttmik system.: ',
        res.status,
        res.statusText,
        res.data,
      );
      throw new Error('TTMIK System 비밀번호 변경 요청 실패 하였습니다.');
    }
  }
}
