import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { now, HydratedDocument } from 'mongoose';

export type FaqBoardDocument = HydratedDocument<FaqBoard>;

@Schema({ timestamps: true })
export class FaqBoard {
  @Prop()
  categoryId: string;

  @Prop()
  question: string;

  @Prop()
  answer: string;

  @Prop({})
  createdAt?: Date;
}

export const FaqBoardSchema = SchemaFactory.createForClass(FaqBoard);