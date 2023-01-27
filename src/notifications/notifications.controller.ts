import { Body, Controller, Get, Param, Post, Put, Query } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiOkResponsePaginated } from 'src/common/decorators/response.decorator';
import { GetNotificationsDto } from './dto/get-notification.dto';
import {
  NotificationConfigDto,
  UpdateNotificationConfigDto,
} from './dto/notification-config.dto';
import { CreateNotificationDto, NotificationDto } from './dto/notification.dto';
import { NotificationConfigTypes } from './enums';

@Controller('notifications')
@ApiTags('notifications')
export class NotificationsController {
  @Post('config/init')
  @ApiOperation({ summary: '(-) 자동 알림 규칙 초기화 (데이터 없을시 실행)' })
  configInit() {}

  @Put('config/:id')
  @ApiOperation({ summary: '자동 알림 규칙 수정' })
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
