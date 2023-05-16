import { Injectable } from '@nestjs/common';
import { DynamicLinkQuery, PushParams } from '../interfaces';
import * as admin from 'firebase-admin';
import { AppConfigService } from 'src/config';
import { HttpService } from '@nestjs/axios';
import {
  ANDROID_PACKAGE_NAME,
  DYNAMICLINK_POST_URL,
  DYNAMICLINK_URL_PREFIX,
  IOS_BUNDLE_ID,
} from '../common.constant';

@Injectable()
export class FirebaseService {
  constructor(
    private configService: AppConfigService,
    private httpService: HttpService,
  ) {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: this.configService.firebaseProjectId,
        clientEmail: this.configService.firebaseClientEmail,
        privateKey: this.configService.firebasePrivateKey.replace(/\\n/g, '\n'),
      }),
    });
  }

  // Firebase Cloud Messaging 발송
  sendPush(params: PushParams) {
    if (!params.payload) {
      params.payload = {};
    }
    Object.keys(params.payload).map((key) => {
      if (typeof params.payload[key] !== 'string') {
        params.payload[key] = String(params.payload[key]);
      }
    });

    admin
      .messaging()
      .sendAll(
        params.tokens.map((x) => ({
          token: x,
          android: {
            priority: 'high',
          },
          notification: {
            title: params.title,
            body: params.message,
          },
          data: {
            title: params.title,
            body: params.message,
            ...params.payload,
          },
        })),
      )
      .catch((error) => {
        console.error('Firebase Messaging sendAll errors: ', error);
      });
  }

  // 다이나믹 링크 생성
  async generateDynamicLink(params: DynamicLinkQuery): Promise<string> {
    const res = await this.httpService.axiosRef.post(
      DYNAMICLINK_POST_URL,
      {
        dynamicLinkInfo: {
          domainUriPrefix: DYNAMICLINK_URL_PREFIX,
          link: `${this.configService.host}/link?action=${params.action}&payload=${params.payload}`,
          androidInfo: {
            androidPackageName: ANDROID_PACKAGE_NAME,
          },
          iosInfo: {
            iosBundleId: IOS_BUNDLE_ID,
          },
        },
      },
      { params: { key: this.configService.googleAPIKey } },
    );

    return res.data.shortLink;
  }
}
