import { ApiProperty } from '@nestjs/swagger';
import { PagingExcelDateReqDto } from 'src/common/dto/request.dto';
import { NotificationContexts } from '../enums';

export class GetNotificationsDto extends PagingExcelDateReqDto {
  @ApiProperty({ description: '알림종류', enum: NotificationContexts })
  context: NotificationContexts;
}
