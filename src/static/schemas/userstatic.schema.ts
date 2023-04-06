import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { now, HydratedDocument, Types } from 'mongoose';

export type UserStaticDocument = HydratedDocument<UserStatic>;

@Schema({ timestamps: true })
export class UserStatic {
  _id?: string;

  @Prop()
  userId: Types.ObjectId;

  @Prop()
  totalStudyTime: number;

  @Prop()
  read: number;

  @Prop()
  correctRate: number;

  @Prop()
  words: number;

  @Prop({})
  createdAt?: Date;
}

export const UserStaticSchema = SchemaFactory.createForClass(UserStatic);