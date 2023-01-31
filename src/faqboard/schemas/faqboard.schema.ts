import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type FaqBoardDocument = HydratedDocument<FaqBoard>;

@Schema()
export class FaqBoard {
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

export const FaqBoardSchema = SchemaFactory.createForClass(FaqBoard);
