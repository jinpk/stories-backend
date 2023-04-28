import { Module } from '@nestjs/common';
import { NotificationsModule } from 'src/notifications/notifications.module';
import { EventService } from './event.service';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [NotificationsModule, UsersModule],
  providers: [EventService],
})
export class EventModule {}
