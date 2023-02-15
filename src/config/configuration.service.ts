import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AppConfigService {
  constructor(private configService: ConfigService) {}

  get mongoURI(): string {
    return this.configService.get<string>('app.mongoURI');
  }
  get jwtSecret(): string {
    return this.configService.get<string>('app.jwtSecret');
  }
  get awsAccessKey(): string {
    return this.configService.get<string>('app.awsAccessKey');
  }
  get awsSecret(): string {
    return this.configService.get<string>('app.awsSecret');
  }
  get host(): string {
    return this.configService.get<string>('app.host');
  }
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


  

}
