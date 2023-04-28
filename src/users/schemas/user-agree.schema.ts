import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, SchemaTypes, Types } from 'mongoose';
import { UserAgreeTypes } from '../enums';

export type UserAgreeDocument = HydratedDocument<UserAgree>;

@Schema({ timestamps: true })
export class UserAgree {
  _id?: Types.ObjectId;

  @Prop({ type: SchemaTypes.ObjectId })
  userId: Types.ObjectId;

  @Prop({ enum: UserAgreeTypes })
  type: UserAgreeTypes;

  @Prop({})
  agreed: boolean;

  @Prop({ default: null })
  createdAt?: Date;

  @Prop({ default: null })
  updatedAt?: Date;
}

export const UserAgreeSchema = SchemaFactory.createForClass(UserAgree);
