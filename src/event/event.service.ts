import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import {
  PasswordResetedEvent,
  PasswordResetEvent,
} from 'src/auth/events/password-reset.event';
import { VerifyEmailEvent } from 'src/auth/events/verify-email.event';
import { EmailService } from 'src/common/providers';
import { NotificationsService } from 'src/notifications/notifications.service';
import { UserCreatedEvent } from 'src/users/events/create-user.event';

@Injectable()
export class EventService {
  private readonly logger = new Logger(EventService.name);
  constructor(
    private readonly notificationsService: NotificationsService,
    private readonly emailService: EmailService,
  ) {}

  // 회원가입 이벤트
  @OnEvent(VerifyEmailEvent.event)
  handleVerifyEmailEvent(payload: VerifyEmailEvent) {
    this.logger.debug(
      `event detected: ${VerifyEmailEvent.event}, ${payload.email}`,
    );

    this.emailService.sendVerifyEmail(payload.email, payload.link);
  }

  // 회원가입 이벤트
  @OnEvent(UserCreatedEvent.event)
  handleUserCreatedEvent(payload: UserCreatedEvent) {
    this.logger.debug(
      `event detected: ${UserCreatedEvent.event}, ${payload.userId}`,
    );

    this.notificationsService.initUserNotificationSettings(payload.userId);
    this.emailService.sendJoinedEmail(payload.email, payload.nickname);
  }

  // 비밀번호 재설정 요청 이벤트
  @OnEvent(PasswordResetEvent.event)
  handlePasswordResetEvent(payload: PasswordResetEvent) {
    this.logger.debug(
      `event detected: ${PasswordResetEvent.event}, ${payload.email}`,
    );
    this.emailService.sendPasswordResetEmail(
      payload.email,
      payload.nickname,
      payload.link,
    );
  }

  // 비밀번호 재설정 완료 이벤트
  @OnEvent(PasswordResetedEvent.event)
  handlePasswordResetedEvent(payload: PasswordResetedEvent) {
    this.logger.debug(
      `event detected: ${PasswordResetedEvent.event}, ${payload.email}`,
    );
    this.emailService.sendPasswordChangedEmail(
      payload.email,
      payload.nickname,
      payload.resetLink,
    );
  }

  // 결제 검증 완료 이벤트
}
