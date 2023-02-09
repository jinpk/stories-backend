import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { join } from 'path';
import { AppModule } from './app.module';
import { AppConfigService } from './config';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.enableCors({ origin: '*' });
  app.useGlobalPipes(new ValidationPipe());
  const configService = app.get(AppConfigService);
  const config = new DocumentBuilder()
    .setTitle('Stories API')
    .setDescription('The stories API description')
    .setVersion('0.1')
    .addTag('auth', '서비스 인증')
    .addTag('users', '회원 관리')
    .addTag('coupons', '쿠폰 관리')
    .addTag('notifications', '알림 관리')
    .addTag('subscriptions', '구독 관리')
    .addTag('files', '공통 파일 API')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('openapi', app, document);

  app.useStaticAssets(join(__dirname, '..', 'public'));
  app.setBaseViewsDir(join(__dirname, '..', 'views'));
  app.setViewEngine('ejs');

  await app.listen(configService.port);
}
bootstrap();
