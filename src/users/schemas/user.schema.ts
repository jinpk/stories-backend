import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, SchemaTypes, Types } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

@Schema({ timestamps: true })
export class User {
  @Prop()
  email: string;

  @Prop({ uppercase: true })
  countryCode: string;

  @Prop({})
  fcmToken?: string;

  @Prop({ type: SchemaTypes.ObjectId, default: null })
  subscriptionId?: Types.ObjectId;

  @Prop({ default: false })
  deleted?: boolean;
  @Prop({ default: null })
  deletedAt?: Date;
  @Prop({ default: null })
  createdAt?: Date;
  @Prop({ default: null })
  updatedAt?: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
