import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';

@Injectable()
export class SchedulerService {
  private readonly logger = new Logger(SchedulerService.name);

  @Cron('0 * * * * *')
  handleEveryMinute() {
    this.logger.log('scheduling evenry minute!');
    // Firebase Push 알림 전송 필요.
  }
}
