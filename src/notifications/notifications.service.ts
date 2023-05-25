/*
  notification 조회, 관리, 수정 서비스함수
  -관리자 설정 조회/수정/등록
  -사용자 알림 설정 조회/수정/등록
*/

import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { PagingResDto } from 'src/common/dto/response.dto';
import { CommonExcelService } from 'src/common/providers/excel.service';
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
import {
  NotificationConfigTypes,
  NotificationContexts,
  NotificationSettingTypes,
} from './enums';
import { EXCEL_COLUMN_LIST } from './notifications.constant';
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
    private commonExcelService: CommonExcelService,
    @InjectModel(Notification.name)
    private notificationModel: mongoose.Model<NotificationDocument>,
    @InjectModel(NotificationConfig.name)
    private notificationConfigModel: mongoose.Model<NotificationConfigDocument>,
    @InjectModel(NotificationSetting.name)
    private notificationSettingModel: mongoose.Model<NotificationSettingDocument>,
  ) {}

  /*
  * 유저 알림 설정 수정
  * @params:
  *   id:                   string
  *   body:                 UpdateNotificationSettingDto
  * @return: 
  */
  async updateNotificationSetting(
    id: string,
    body: UpdateNotificationSettingDto,
  ) {
    body.remindDays = body.remindDays || '';
    body.remindTime = body.remindTime || '';
    
    await this.notificationSettingModel.findByIdAndUpdate(id,
      {
        on: body.on,
        remindDays: body.remindDays,
        remindTime: body.remindTime,
      
      }
    );
  }

  /*
  * 유저 알림 설정 조회
  * @params:
  *   userId:                   string
  * @return: [
  *   NotificationSetting            NotificationSettingDto Array
  * ]
  */
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

  /*
  * 알림 발송 목록 수정
  * @params:
  * @return: [
  *   Notification            NotificationDto Array
  * ]
  */
  async getPendingPushNotifications(): Promise<NotificationDto[]> {
    const now = new Date();
    const docs = await this.notificationModel.find({
      sent: false,
      context: { $ne: NotificationContexts.InApp },
      sendAt: { $lte: now },
    });

    const data: NotificationDto[] = docs.map((doc) =>
      this._notificationDocToDto(doc),
    );
    return data;
  }

  /*
  * 알림 발송 목록 수정
  * @params:
  *   ids: []                         stringArray
  * @return:
  */
  async sentNotifications(ids: string[]) {
    await this.notificationModel.updateMany(
      { _id: { $in: ids } },
      { $set: { sent: true } },
    );
  }

  /*
  * config 수정
  * @params:
  *   id:                         string
  *   body:                       UpdateNotificationConfigDto
  * @return:
  */
  async updateNotificationConfigs(
    id: string,
    body: UpdateNotificationConfigDto,
  ) {
    await this.notificationConfigModel.findByIdAndUpdate(id, { $set: body });
  }


  /*
  * config 조회
  * @params:
  * @return: [
  *   NotificationConfig          NotificationConfigDto
  * ]
  */
  async getNotificationConfigs(): Promise<NotificationConfigDto[]> {
    const docs = await this.notificationConfigModel.find({});
    const data: NotificationConfigDto[] = docs.map((doc) =>
      this._notificationConfigDocToDto(doc),
    );

    return data;
  }

  /*
  * 등록한 알림 목록 조회
  * @query:
  *   query:                GetNotificationsDto
  * @return: {
  *   total:                number
  *   data: [
  *     {Notification}      NotificationDto
  *   ]
  * }
  */
  async getPagingNotifications(
    query: GetNotificationsDto,
  ): Promise<PagingResDto<NotificationDto> | Buffer> {
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

    if (query.excel === '1') {
      const docs = await this.notificationModel
        .find(filter)
        .sort({ createdAt: -1 });
      return await this.commonExcelService.listToExcelBuffer(
        EXCEL_COLUMN_LIST,
        docs,
      );
    }

    const docs = await this.notificationModel
      .find(filter)
      .sort({ createdAt: -1 })
      .limit(parseInt(query.limit))
      .skip((parseInt(query.page) - 1) * parseInt(query.limit));

    const total = await this.notificationModel.countDocuments(filter);
    const data: NotificationDto[] = docs.map((doc) =>
      this._notificationDocToDto(doc),
    );
    return {
      total,
      data,
    };
  }

  /*
  * 알림 생성
  * @params:
  *   body:                CreateNotificationDto
  * @return:
  *   id:                 string
  */
  async createNotification(body: CreateNotificationDto) {
    const doc = await new this.notificationModel({
      context: body.context,
      sendAt: body.sendAt,
      imagePath: body.imagePath,
      title: body.title,
      message: body.message,
    }).save();
    return doc._id.toString();
  }

  /*
  * 알림 config 초기화
  * @params:
  * @return: {
  */
  async initNotificationConfigs() {
    const configs: NotificationConfig[] = [
      {
        type: NotificationConfigTypes.AppConn,
      },
      {
        type: NotificationConfigTypes.LevelUp,
      },
      {
        type: NotificationConfigTypes.Paymented,
      },
      {
        type: NotificationConfigTypes.PrePayment,
      },
      {
        type: NotificationConfigTypes.Quiz,
      },
      {
        type: NotificationConfigTypes.Reminder,
      },
    ];
    for await (const config of configs) {
      await new this.notificationConfigModel(config).save();
    }
    this.logger.log(`initialized notification configs`);
  }

  /*
  * 유저 알림 설정 초기화
  * @params:
  *   userId:             string
  * @return: 
  */
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

  /*
  * Schema to dto 변환
  * @params:
  *   doc:                NotificationDocument
  * @return: {
  *   dto:               NotificationDto
  */
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

  /*
  * Schema to dto 변환
  * @params:
  *   doc:                NotificationConfigDocument
  * @return: {
  *   dto:               NotificationConfigDto
  */
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

  /*
  * Schema to dto 변환
  * @params:
  *   doc:                NotificationSettingDocument
  * @return: {
  *   dto:               NotificationSettingDto
  */
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
