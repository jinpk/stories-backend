import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { now, HydratedDocument } from 'mongoose';

export type FaqCategoryDocument = HydratedDocument<FaqCategory>;

@Schema({ timestamps: true })
export class FaqCategory {
  @Prop()
  category: string;

  @Prop({default: now()})
  createdAt?: Date;
}

export const FaqCategorySchema = SchemaFactory.createForClass(FaqCategory);
