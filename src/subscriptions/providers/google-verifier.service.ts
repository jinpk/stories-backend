import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ANDROID_PACKAGE_NAME } from 'src/common/common.constant';

export const GOOGLE_VERIFY_URL_PREFIX =
  'https://androidpublisher.googleapis.com/androidpublisher/v3/applications';

@Injectable()
export class GoogleVerifierService {
  private access_token = '';

  constructor(private httpService: HttpService) {}

  // token이 유효한경우만 검증
  async verifySubscription(token: string): Promise<object> {
    const res = await this.httpService.axiosRef.get(
      `${GOOGLE_VERIFY_URL_PREFIX}/${ANDROID_PACKAGE_NAME}/purchases/subscriptionsv2/tokens/${token}`,
      {
        params: {
          access_token: this.access_token,
        },
      },
    );

    const data = res.data;

    const state = data.subscriptionState;

    if (state !== 'SUBSCRIPTION_STATE_ACTIVE') {
      throw new Error('유효하지 않은 구독 결제건입니다.: CODE: ' + state);
    }

    return data;
  }
}
