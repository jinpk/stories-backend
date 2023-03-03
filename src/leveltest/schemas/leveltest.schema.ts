import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { now, HydratedDocument } from 'mongoose';

export type LevelTestDocument = HydratedDocument<LevelTest>;

@Schema({ timestamps: true })
export class LevelTest {
  @Prop()
  level: string;

  @Prop()
  text: string;

  @Prop()
  answers: string[];

  @Prop()
  correct_answer: number;

  @Prop({default: now()})
  createdAt?: Date;
}

export const LevelTestSchema = SchemaFactory.createForClass(LevelTest);
