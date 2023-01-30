import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import {
  NotificationConfig,
  NotificationConfigSchema,
} from './schemas/noficiation-config.schema';
import {
  NotificationSetting,
  NotificationSettingSchema,
} from './schemas/noficiation-setting.schema';
import { Notification, NotificationSchema } from './schemas/noficiation.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Notification.name, schema: NotificationSchema },
    ]),
    MongooseModule.forFeature([
      { name: NotificationConfig.name, schema: NotificationConfigSchema },
    ]),
    MongooseModule.forFeature([
      { name: NotificationSetting.name, schema: NotificationSettingSchema },
    ]),
  ],
  controllers: [NotificationsController],
  providers: [NotificationsService],
  exports: [NotificationsService],
})
export class NotificationsModule {}
