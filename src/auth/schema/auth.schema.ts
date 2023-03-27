import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { now, HydratedDocument, Types } from 'mongoose';

export type AuthDocument = HydratedDocument<Auth>;

@Schema({ timestamps: true })
export class Auth {
  _id?: Types.ObjectId;

  @Prop({})
  email: string;

  @Prop({})
  code: string;

  // 사용했다면
  @Prop({ default: false })
  used: boolean;

  // 인증했다면
  @Prop({ default: false })
  verified: boolean;

  @Prop()
  createdAt?: Date;
}

export const AuthSchema = SchemaFactory.createForClass(Auth);
