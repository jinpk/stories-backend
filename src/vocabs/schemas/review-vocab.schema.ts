import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { now, HydratedDocument, Types } from 'mongoose';

export type ReviewVocabDocument = HydratedDocument<ReviewVocab>;

@Schema({ timestamps: true })
export class ReviewVocab {
  @Prop()
  userId: string;

  @Prop()
  vocabId: Types.ObjectId;

  @Prop()
  level: string;

  @Prop({default: false})
  complete: boolean;

  @Prop({})
  createdAt?: Date;

  @Prop({})
  updatedAt?: Date;
}

export const ReviewVocabSchema = SchemaFactory.createForClass(ReviewVocab);
