import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { MongooseModule } from '@nestjs/mongoose';
import { AppConfigModule, AppConfigService } from './config';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './auth/guard/jwt-auth.guard';
import { JwtStrategy } from './auth/strategy/jwt.strategy';
import { LeveltestService } from './leveltest/leveltest.service';
import { EducontentsService } from './educontents/educontents.service';
import { WordsService } from './words/words.service';
import { WordsModule } from './words/words.module';
import { EducontentsModule } from './educontents/educontents.module';
import { LeveltestModule } from './leveltest/leveltest.module';

@Module({
  imports: [
    AppConfigModule,
    MongooseModule.forRootAsync({
      imports: [AppConfigModule],
      useFactory: async (configService: AppConfigService) => ({
        uri: configService.mongoURI,
      }),
      inject: [AppConfigService],
    }),
    UsersModule,
    AuthModule,
    WordsModule,
    EducontentsModule,
    LeveltestModule,
  ],
  controllers: [AppController],
  providers: [AppConfigService, LeveltestService, EducontentsService, WordsService],
})
export class AppModule {}
