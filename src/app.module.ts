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
import { EducontentsModule } from './educontents/educontents.module';
import { LeveltestModule } from './leveltest/leveltest.module';
import { VocabsController } from './vocabs/vocabs.controller';
import { VocabsService } from './vocabs/vocabs.service';
import { VocabsModule } from './vocabs/vocabs.module';

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
    EducontentsModule,
    LeveltestModule,
    VocabsModule,
  ],
  controllers: [AppController, VocabsController],
  providers: [AppConfigService, LeveltestService, EducontentsService, VocabsService],
})
export class AppModule {}
