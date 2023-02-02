import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Reminder, ReminderDocument } from './schemas/reminder.schema';

@Injectable()
export class ReminderService {
    constructor(
        @InjectModel(Reminder.name) private reminderModel: Model<ReminderDocument>,
      ) {}
    
      async GetReminder(reminder_id: string): Promise<ReminderDocument | false> {
        const reminder = await this.reminderModel.findById(reminder_id);
        if (!reminder) {
          return false;
        }
        return reminder;
      }
}
