import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types, HydratedDocument } from 'mongoose';

export type FaqBoardDocument = HydratedDocument<FaqBoard>;

@Schema({ timestamps: true })
export class FaqBoard {
  @Prop()
  _id?: Types.ObjectId;

  @Prop()
  categoryId: Types.ObjectId;

  @Prop()
  question: string;

  @Prop()
  answer: string;

  @Prop({})
  createdAt?: Date;
}

export const FaqBoardSchema = SchemaFactory.createForClass(FaqBoard);
