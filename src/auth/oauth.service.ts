import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { OAuth2Client } from 'google-auth-library';
import { AppConfigService } from 'src/config';
import { OAuthProviers } from './enums';
import { OAuthResult } from './interfaces';
@Injectable()
export class OAuthService {
  private readonly facebookGraphUrl = 'https://graph.facebook.com/v15.0/me';
  private readonly googleClient: OAuth2Client;

  constructor(
    private readonly configService: AppConfigService,
    private readonly httpService: HttpService,
  ) {
    this.googleClient = new OAuth2Client({
      clientId: configService.googleClientId,
      clientSecret: configService.googleClientSecret,
    });
  }

  async decodeGoogle(idToken: string): Promise<OAuthResult> {
    const ticket = await this.googleClient.verifyIdToken({ idToken });
    const userId = ticket.getUserId();
    const payload = ticket.getPayload();
    const result: OAuthResult = {
      id: userId,
      name: payload.given_name,
      email: payload.email,
      provider: OAuthProviers.Google,
    };

    return result;
  }

  async decodeFacebook(accessToken: string): Promise<OAuthResult> {
    const res = await this.httpService.axiosRef.get(this.facebookGraphUrl, {
      params: {
        access_token: accessToken,
      },
    });

    const data = res.data;

    const result: OAuthResult = {
      id: data.id,
      name: data.name,
      email: data.email || '',
      provider: OAuthProviers.Facebook,
    };

    return result;
  }

  async decodeApple(idToken: string): Promise<OAuthResult> {
    throw new Error('애플 지원 X');
  }
}
