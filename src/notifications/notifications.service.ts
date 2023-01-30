import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { PagingResDto } from 'src/common/dto/response.dto';
import { GetNotificationsDto } from './dto/get-notification.dto';
import {
  NotificationConfigDto,
  UpdateNotificationConfigDto,
} from './dto/notification-config.dto';
import {
  NotificationSettingDto,
  UpdateNotificationSettingDto,
} from './dto/notification-setting.dto';
import { CreateNotificationDto, NotificationDto } from './dto/notification.dto';
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

  async updateNotificationSetting(
    id: string,
    body: UpdateNotificationSettingDto,
  ) {
    body.remindDays = body.remindDays || '';
    body.remindTime = body.remindTime || '';
    await this.notificationSettingModel.findByIdAndUpdate(id, { $set: body });
  }

  async getUserNotificationSettings(
    userId: string,
  ): Promise<NotificationSettingDto[]> {
    const docs = await this.notificationSettingModel.find({
      userId: new mongoose.Types.ObjectId(userId),
    });

    const data: NotificationSettingDto[] = docs.map((doc) =>
      this._notificationSettingDocToDto(doc),
    );

    return data;
  }

  async updateNotificationConfigs(
    id: string,
    body: UpdateNotificationConfigDto,
  ) {
    await this.notificationConfigModel.findByIdAndUpdate(id, { $set: body });
  }

  async getNotificationConfigs(): Promise<NotificationConfigDto[]> {
    const docs = await this.notificationConfigModel.find({});
    const data: NotificationConfigDto[] = docs.map((doc) =>
      this._notificationConfigDocToDto(doc),
    );

    return data;
  }

  async getPagingNotifications(
    query: GetNotificationsDto,
  ): Promise<PagingResDto<NotificationDto>> {
    const filter: mongoose.FilterQuery<NotificationDocument> = {};

    if (query.start) {
      filter.createdAt = { $gte: new Date(query.start) };
    }

    if (query.end) {
      filter.createdAt = { $lte: new Date(query.end) };
    }

    if (query.context) {
      filter.context = query.context;
    }

    const docs = await this.notificationModel
      .find(filter)
      .limit(parseInt(query.limit))
      .skip((parseInt(query.page) - 1) * parseInt(query.limit))
      .sort({ createdAt: -1 });

    const total = await this.notificationModel.countDocuments(filter);
    const data: NotificationDto[] = docs.map((doc) =>
      this._notificationDocToDto(doc),
    );
    return {
      total,
      data,
    };
  }

  async createNotification(body: CreateNotificationDto) {
    const doc = await new this.notificationModel({
      context: body.context,
      sendAt: body.sendAt,
      imagePath: body.imagePath,
      title: body.title,
      message: body.message,
    });
    return doc._id.toString();
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

  _notificationDocToDto(doc: NotificationDocument): NotificationDto {
    const dto = new NotificationDto();
    dto.context = doc.context;
    dto.createdAt = doc.createdAt;
    dto.id = doc._id.toString();
    dto.imagePath = doc.imagePath;
    dto.message = doc.message;
    dto.sendAt = doc.sendAt;
    dto.title = doc.title;
    return dto;
  }

  _notificationConfigDocToDto(
    doc: NotificationConfigDocument,
  ): NotificationConfigDto {
    const dto = new NotificationConfigDto();
    dto.context = doc.context;
    dto.day = doc.day;
    dto.id = doc._id.toString();
    dto.message = doc.message;
    dto.on = doc.on;
    dto.type = doc.type;
    return dto;
  }

  _notificationSettingDocToDto(
    doc: NotificationSettingDocument,
  ): NotificationSettingDto {
    const dto = new NotificationSettingDto();
    dto.id = doc._id.toString();
    dto.on = doc.on;
    dto.remindDays = doc.remindDays;
    dto.remindTime = doc.remindTime;
    dto.type = doc.type;
    dto.userId = doc.userId;
    return dto;
  }
}
