import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { DayTime } from '../dto/reminder.dto'

export type ReminderDocument = HydratedDocument<Reminder>;

@Schema()
export class Reminder {
  @Prop()
  userId: string;

  @Prop()
  daytime: DayTime;

  @Prop()
  hour: number;

  @Prop()
  minute: number;

  @Prop()
  day: string[];
}

export const ReminderSchema = SchemaFactory.createForClass(Reminder);
