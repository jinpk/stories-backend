import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { now, HydratedDocument } from 'mongoose';

export type BookmarkDocument = HydratedDocument<Bookmark>;

@Schema({ timestamps: true })
export class Bookmark {
  @Prop()
  userId: string;
  
  @Prop()
  eduContentsId: string;
  
  @Prop({default: now()})
  createdAt?: Date;
}

export const BookmarkSchema = SchemaFactory.createForClass(Bookmark);