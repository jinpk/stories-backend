import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { FirebaseService } from 'src/common/providers';
import { NotificationsService } from 'src/notifications/notifications.service';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class SchedulerService {
  private readonly logger = new Logger(SchedulerService.name);

  constructor(
    private notificationService: NotificationsService,
    private usernService: UsersService,
    private firebaseService: FirebaseService,
  ) {}

  // 관리자에서 등록한 알림
  // 시간 도달하면 사용자에게 일괄적으로 알림 발송하는 Cron 배치 스케쥴러
  @Cron('0 * * * * *')
  handleEveryMinute() {
    this.logger.log('scheduling evenry minute!');

    this.notificationService
      .getPendingPushNotifications()
      .then(async (notifications) => {
        this.logger.log(`found ${notifications.length} pending notifications!`);
        // 알림 없으면 스킵
        if (!notifications.length) {
          return;
        }

        // 알림 전송 Update 변경
        this.notificationService.sentNotifications(
          notifications.map((x) => x.id),
        );

        // FCM Token 가진 유저 조회
        const tokens = await this.usernService.getActiveFCMUsers();
        this.logger.log(`found ${tokens.length} notification receviers!`);
        if (!tokens.length) {
          return;
        }

        // FCM 실제 알림 발송
        notifications.forEach((notification) => {
          this.firebaseService.sendPush({
            tokens,
            title: notification.title,
            message: notification.message,
          });
        });
      })
      .catch((error) => {
        console.error(`get pending notifications error: `, error);
      });
  }
}
