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

    console.log('verifyEmail', JSON.stringify(res.data));
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

    console.log('resetPassword', JSON.stringify(res.data));
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

    console.log('validatePassword', JSON.stringify(res.data));
  }
}
