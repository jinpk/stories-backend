import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { InjectModel } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { UserCreatedEvent } from 'src/users/events/create-user.event';
import { NotificationSettingTypes } from './enums';
import {
  NotificationConfig,
  NotificationConfigDocument,
} from './schemas/noficiation-config.schema';
import {
  NotificationSetting,
  NotificationSettingDocument,
} from './schemas/noficiation-setting.schema';
import {
  Notification,
  NotificationDocument,
} from './schemas/noficiation.schema';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);
  constructor(
    @InjectModel(Notification.name)
    private notificationModel: mongoose.Model<NotificationDocument>,
    @InjectModel(NotificationConfig.name)
    private notificationConfigModel: mongoose.Model<NotificationConfigDocument>,
    @InjectModel(NotificationSetting.name)
    private notificationSettingModel: mongoose.Model<NotificationSettingDocument>,
  ) {}

  @OnEvent(UserCreatedEvent.event)
  handleUserCreatedEvent(payload: UserCreatedEvent) {
    this.logger.debug(
      `event detected: ${UserCreatedEvent.event}, ${payload.userId}`,
    );

    this.initUserNotificationSettings(payload.userId);
  }

  async initUserNotificationSettings(userId: string) {
    const oid = new mongoose.Types.ObjectId(userId);

    const settings: NotificationSetting[] = [
      {
        type: NotificationSettingTypes.Promotion,
        on: true,
        userId: oid,
        remindDays: '',
        remindTime: '',
      },
      {
        type: NotificationSettingTypes.Service,
        on: true,
        userId: oid,
        remindDays: '',
        remindTime: '',
      },
      {
        type: NotificationSettingTypes.Study,
        on: true,
        userId: oid,
        remindDays: '',
        remindTime: '',
      },
      {
        type: NotificationSettingTypes.Reminder,
        on: true,
        userId: oid,
        remindDays: '',
        remindTime: '1230',
      },
    ];
    await this.notificationSettingModel.deleteMany({ userId: oid });

    for await (const setting of settings) {
      await new this.notificationSettingModel(setting).save();
    }
    this.logger.debug(`initialized notification setting: ${userId}`);
  }
}
