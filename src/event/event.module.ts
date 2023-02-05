import { Module } from '@nestjs/common';
import { EmailModule } from 'src/email/email.module';
import { NotificationsModule } from 'src/notifications/notifications.module';
import { EventService } from './event.service';

@Module({
  imports: [NotificationsModule,EmailModule],
  providers: [EventService],
})
export class EventModule {}
