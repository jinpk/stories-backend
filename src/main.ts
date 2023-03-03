import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { join } from 'path';
import { APPLICATION_PORT } from './app.constant';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.enableCors({ origin: '*' });
  app.useGlobalPipes(new ValidationPipe());

  //swagger
  const config = new DocumentBuilder()
    .setTitle('Stories API')
    .setDescription(
      'The stories API description\n모든 리스트 조회에서 excel: 1 요청시 response에 excel buffer로 내려감.',
    )
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

  //ejs
  app.useStaticAssets(join(__dirname, '..', 'public'));
  app.setBaseViewsDir(join(__dirname, '..', 'views'));
  app.setViewEngine('ejs');

  await app.listen(APPLICATION_PORT);
}
bootstrap();
