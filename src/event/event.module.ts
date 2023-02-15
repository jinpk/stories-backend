import { Module } from '@nestjs/common';
import { NotificationsModule } from 'src/notifications/notifications.module';
import { EventService } from './event.service';

@Module({
  imports: [NotificationsModule],
  providers: [EventService],
})
export class EventModule {}
