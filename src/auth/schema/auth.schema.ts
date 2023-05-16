import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { now, HydratedDocument, Types } from 'mongoose';

export type AuthDocument = HydratedDocument<Auth>;

// 이메일 인증 스키마
@Schema({ timestamps: true })
export class Auth {
  _id?: Types.ObjectId;

  // 인증 대상 이메일
  @Prop({})
  email: string;

  // 인증코드
  @Prop({})
  code: string;

  // 인증 1회 사용 여부
  @Prop({ default: false })
  used: boolean;

  // 인증코드 검증 여부
  @Prop({ default: false })
  verified: boolean;

  @Prop()
  createdAt?: Date;
}

export const AuthSchema = SchemaFactory.createForClass(Auth);
