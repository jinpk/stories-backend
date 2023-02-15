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
import { NotificationsModule } from './notifications/notifications.module';
import { SubscriptionsModule } from './subscriptions/subscriptions.module';
import { FilesModule } from './files/files.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { EventModule } from './event/event.module';
import { SchedulerModule } from './scheduler/scheduler.module';
import { ScheduleModule } from '@nestjs/schedule';
import { FaqboardModule } from './faqboard/faqboard.module';
import { PopupModule } from './popup/popup.module';
import { BannerModule } from './banner/banner.module';
import { ReminderModule } from './reminder/reminder.module';
import { LibraryModule } from './library/library.module';
import { CommonModule } from './common/common.module';

@Module({
  imports: [
    AppConfigModule,
    CommonModule,
    EventEmitterModule.forRoot(),
    ScheduleModule.forRoot(),
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
    NotificationsModule,
    SubscriptionsModule,
    FilesModule,
    EventModule,
    SchedulerModule,
    FaqboardModule,
    PopupModule,
    BannerModule,
    ReminderModule,
    LibraryModule,
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
