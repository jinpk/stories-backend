import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Reminder, ReminderSchema } from './schemas/reminder.schema';
import { ReminderController } from './reminder.controller';
import { ReminderService } from './reminder.service';

@Module({
    imports: [
      MongooseModule.forFeature([{ name: Reminder.name, schema: ReminderSchema }]),
    ],
    controllers: [ReminderController],
    providers: [ReminderService],
    exports: [ReminderService],
  })
export class ReminderModule {}
