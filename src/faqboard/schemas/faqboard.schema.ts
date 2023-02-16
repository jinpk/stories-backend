import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { now, HydratedDocument } from 'mongoose';

export type FaqBoardDocument = HydratedDocument<FaqBoard>;

@Schema({ timestamps: true })
export class FaqBoard {
  @Prop()
  category: string;

  @Prop()
  question: string;

  @Prop()
  answer: string;

  @Prop({default: now()})
  createdAt?: Date;
}

export const FaqBoardSchema = SchemaFactory.createForClass(FaqBoard);
