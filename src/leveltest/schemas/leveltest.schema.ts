import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type LevelTestDocument = HydratedDocument<LevelTest>;

@Schema()
export class LevelTest {
  @Prop()
  contentsSerialNum: string;

  @Prop()
  level: string;

  @Prop()
  text: string;

  @Prop()
  answers: string[];

  @Prop()
  correct_answer: number;
}

export const LevelTestSchema = SchemaFactory.createForClass(LevelTest);
