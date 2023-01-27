import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { AppConfigModule, AppConfigService } from './config';
import { EducontentsModule } from './educontents/educontents.module';
import { LeveltestModule } from './leveltest/leveltest.module';
import { VocabsModule } from './vocabs/vocabs.module';
import { AdminModule } from './admin/admin.module';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './auth/guard/jwt-auth.guard';
import { MongooseModule } from '@nestjs/mongoose';
import { CouponsModule } from './coupons/coupons.module';

@Module({
  imports: [
    AppConfigModule,
    MongooseModule.forRootAsync({
      useFactory: async (configService: AppConfigService) => ({
        uri: configService.mongoURI,
      }),
      inject: [AppConfigService],
    }),
    UsersModule,
    AuthModule,
    EducontentsModule,
    LeveltestModule,
    VocabsModule,
    AdminModule,
    CouponsModule,
  ],
  controllers: [AppController],
  providers: [
    AppConfigService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
