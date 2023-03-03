import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ANDROID_PACKAGE_NAME } from 'src/common/common.constant';

export const GOOGLE_VERIFY_URL_PREFIX =
  'https://androidpublisher.googleapis.com/androidpublisher/v3/applications';

@Injectable()
export class GoogleVerifierService {
  // oauth2Token은 해당 서비스 초기화마다 생성자 함수 혹은 func verifySubscription 호출전 갱신 필요.
  private oauth2Token = '';

  constructor(private httpService: HttpService) {}

  // token이 유효한경우만 검증
  async verifySubscription(token: string): Promise<object> {
    const res = await this.httpService.axiosRef.get(
      `${GOOGLE_VERIFY_URL_PREFIX}/${ANDROID_PACKAGE_NAME}/purchases/subscriptionsv2/tokens/${token}`,
      {
        headers: {
          Authorization: 'Bearer ' + this.oauth2Token,
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
