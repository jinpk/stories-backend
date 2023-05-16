import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types, HydratedDocument } from 'mongoose';

export type BookmarkDocument = HydratedDocument<Bookmark>;

@Schema({ timestamps: true })
export class Bookmark {
  _id?: string;

  @Prop()
  userId: Types.ObjectId;
  
  @Prop()
  eduContentsId: string;
  
  @Prop({})
  createdAt?: Date;
}

export const BookmarkSchema = SchemaFactory.createForClass(Bookmark);