import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { now, HydratedDocument, Types } from 'mongoose';

export type UserStaticDocument = HydratedDocument<UserStatic>;

@Schema({ timestamps: true })
export class UserStatic {
  _id?: string;

  @Prop()
  userId: Types.ObjectId;

  @Prop({default: 0})
  totalStudyTime?: number;

  @Prop({default: 0})
  read?: number;

  @Prop({default: 0})
  correctRate: number;

  @Prop({default: 0})
  words: number;
}

export const UserStaticSchema = SchemaFactory.createForClass(UserStatic);