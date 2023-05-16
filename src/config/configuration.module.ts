import * as Joi from 'joi';
import { Global, Module } from '@nestjs/common';
import configuration from './configuration';
import { AppConfigService } from './configuration.service';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Global()
@Module({
  imports: [
    // 필수 env 정보 검증
    ConfigModule.forRoot({
      load: [configuration],
      validationSchema: Joi.object({
        MONGO_URI: Joi.string().required(),
        JWT_SECRET: Joi.string().required(),
        AWS_ACCESS_KEY: Joi.string().required(),
        TTMIK_JWT_SECRET: Joi.string().required(),
        AWS_SECRET_KEY: Joi.string().required(),
        HOST: Joi.string().uri().required(),
        FIREBASE_PROJECT_ID: Joi.string().required(),
        FIREBASE_PRIVATE_KEY_ID: Joi.string().required(),
        FIREBASE_PRIVATE_KEY: Joi.string().required(),
        FIREBASE_CLIENT_ID: Joi.string().required(),
        FIREBASE_CLIENT_EMAIL: Joi.string().required(),
        GOOGLE_API_KEY: Joi.string().required(),
        // PLAYCONSOLE_PRIVATE_KEY: Joi.string().required(),
        // PLAYCONSOLE_CLIENT_EMAIL: Joi.string().required(),
      }),
    }),
  ],
  providers: [ConfigService, AppConfigService],
  exports: [ConfigService, AppConfigService],
})
export class AppConfigModule {}
