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
}
