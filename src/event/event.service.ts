import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { EmailService } from 'src/email/email.service';
import { NotificationsService } from 'src/notifications/notifications.service';
import { UserCreatedEvent } from 'src/users/events/create-user.event';

@Injectable()
export class EventService {
  private readonly logger = new Logger(EventService.name);
  constructor(
    private readonly notificationsService: NotificationsService,
    private readonly emailService: EmailService,
  ) {}

  @OnEvent(UserCreatedEvent.event)
  handleUserCreatedEvent(payload: UserCreatedEvent) {
    this.logger.debug(
      `event detected: ${UserCreatedEvent.event}, ${payload.userId}`,
    );

    this.notificationsService.initUserNotificationSettings(payload.userId);
  }
}
