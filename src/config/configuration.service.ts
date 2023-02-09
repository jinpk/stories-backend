import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AppConfigService {
  constructor(private configService: ConfigService) {}

  get port(): string {
    return this.configService.get<string>('app.port');
  }
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

  get googleClientId(): string {
    return this.configService.get<string>('app.googleClientId');
  }
  get googleClientSecret(): string {
    return this.configService.get<string>('app.googleClientSecret');
  }
}
