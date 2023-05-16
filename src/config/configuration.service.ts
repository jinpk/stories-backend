import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AppConfigService {
  constructor(private configService: ConfigService) {}
  get mongoURI(): string {
    return this.configService.get<string>('app.mongoURI');
  }
  // 스토리즈 인증 시스템에 사용하는 JWT SECRET
  get jwtSecret(): string {
    return this.configService.get<string>('app.jwtSecret');
  }
  // TTMIK 서비스 호출을 위한 JWT SECRET
  get ttmikJwtSecret(): string {
    return this.configService.get('app.ttmikJwtSecret');
  }
  // AWS 연결 정보
  get awsAccessKey(): string {
    return this.configService.get<string>('app.awsAccessKey');
  }
  get awsSecret(): string {
    return this.configService.get<string>('app.awsSecret');
  }
  // 서버 HOST 정보 - 이메일 발송 링크에 default host로 사용
  get host(): string {
    return this.configService.get<string>('app.host');
  }
  // 다이나믹 링크 및 알림 발송에 필요한 파이어베이스 연결 정보
  get firebaseProjectId(): string {
    return this.configService.get('app.firebaseProjectId');
  }
  get firebasePrivateKeyId(): string {
    return this.configService.get('app.firebasePrivateKeyId');
  }
  get firebasePrivateKey(): string {
    return this.configService.get('app.firebasePrivateKey');
  }
  get firebaseClientId(): string {
    return this.configService.get('app.firebaseClientId');
  }
  get firebaseClientEmail(): string {
    return this.configService.get('app.firebaseClientEmail');
  }
  get googleAPIKey(): string {
    return this.configService.get('app.googleAPIKey');
  }

  // 안드로이드 인앱결제 검증을 위해 필요한 credentails
  get playConsoleClientEmail(): string {
    return this.configService.get('app.playConsoleClientEmail');
  }
  get playConsolePrivateKey(): string {
    return this.configService.get('app.playConsolePrivateKey');
  }
}
