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
import { UsersAgreeService } from 'src/users/users-agree.service';

@Injectable()
export class EventService {
  private readonly logger = new Logger(EventService.name);
  constructor(
    private readonly notificationsService: NotificationsService,
    private readonly emailService: EmailService,
    private readonly usersAgreeService: UsersAgreeService,
  ) {}

  // 인증요청 이벤트
  @OnEvent(VerifyEmailEvent.event)
  handleVerifyEmailEvent(payload: VerifyEmailEvent) {
    this.logger.debug(
      `event detected: ${VerifyEmailEvent.event}, ${payload.email}`,
    );
    // 인증 확인 이메일 발송
    this.emailService.sendVerifyEmail(payload.email, payload.code);
  }

  // 회원가입 이벤트
  @OnEvent(UserCreatedEvent.event)
  handleUserCreatedEvent(payload: UserCreatedEvent) {
    this.logger.debug(
      `event detected: ${UserCreatedEvent.event}, ${payload.userId}`,
    );

    // 사용자 타입별 알림 on/off 여부 리스트 초기화
    this.notificationsService.initUserNotificationSettings(payload.userId);
    // 웰컬 이메일 발송
    this.emailService.sendJoinedEmail(payload.email, payload.nickname);
    // 사용자 약관동의 리스트 초기화
    this.usersAgreeService.initAgreesByUserId(payload.userId);
  }

  // 비밀번호 재설정 요청 이벤트
  @OnEvent(PasswordResetEvent.event)
  handlePasswordResetEvent(payload: PasswordResetEvent) {
    this.logger.debug(
      `event detected: ${PasswordResetEvent.event}, ${payload.email}`,
    );
    // 비밀번호 재설정 인증코드 이메일 발송
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
    // 비밀번호 재설정 변경 이메일 발송
    this.emailService.sendPasswordChangedEmail(
      payload.email,
      payload.nickname,
      payload.resetLink,
    );
  }
}
