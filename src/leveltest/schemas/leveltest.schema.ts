import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { now, HydratedDocument } from 'mongoose';

export type LevelTestDocument = HydratedDocument<LevelTest>;

@Schema({ timestamps: true })
export class LevelTest {
  @Prop()
  step: string;

  @Prop()
  sequence: string;

  @Prop()
  text: string;

  @Prop()
  answers: string[];

  @Prop()
  correct_answer: number;

  @Prop({})
  createdAt?: Date;
}

export const LevelTestSchema = SchemaFactory.createForClass(LevelTest);
