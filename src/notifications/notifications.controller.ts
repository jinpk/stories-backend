import { Body, Controller, Get, Param, Post, Put, Query } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { ApiOkResponsePaginated } from 'src/common/decorators/response.decorator';
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
import { NotificationConfigTypes } from './enums';

@Controller('notifications')
@ApiTags('notifications')
@ApiBearerAuth()
export class NotificationsController {
  @Put('settings/:id')
  @ApiOperation({ summary: '사용자 알림 설정 수정' })
  @ApiParam({ name: 'id', description: 'settingId' })
  updateUserNotificationSetting(
    @Param('id') id: string,
    @Body() body: UpdateNotificationSettingDto,
  ) {}

  @Get('settings')
  @ApiOperation({ summary: '사용자 알림 설정 조회' })
  @ApiOkResponse({ type: [NotificationSettingDto] })
  getUserNotificationSettings(@Query('userId') userId: string) {}

  @Post('config/init')
  @ApiOperation({ summary: '(-) 자동 알림 규칙 초기화 (데이터 없을시 실행)' })
  configInit() {}

  @Put('config/:id')
  @ApiOperation({ summary: '자동 알림 규칙 수정' })
  @ApiParam({ name: 'id', description: 'configId' })
  updateConfig(
    @Param('id') id: NotificationConfigTypes,
    @Body() body: UpdateNotificationConfigDto,
  ) {}

  @Get('config')
  @ApiOperation({ summary: '자동 알림 규칙 조회' })
  @ApiOkResponse({ type: [NotificationConfigDto] })
  getConfig() {}

  @Post('')
  @ApiOperation({ summary: '알림 등록' })
  createNotification(@Body() body: CreateNotificationDto) {}

  @Get('')
  @ApiOperation({ summary: '알림 조회' })
  @ApiOkResponsePaginated(NotificationDto)
  listNotification(@Query() query: GetNotificationsDto) {}
}
