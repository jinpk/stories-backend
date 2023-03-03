import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { HydratedDocument, SchemaTypes, Types } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

@Schema({ timestamps: true })
export class User {
  @Prop()
  @ApiProperty({ description: 'TTMIK user email 미러링' })
  email: string;

  @Prop()
  @ApiProperty({ description: 'Stories 고유 닉네임' })
  nickname: string;

  @Prop({ uppercase: true })
  @ApiProperty({ description: 'Stories 마지막 로그인 국가' })
  countryCode: string;

  @Prop({})
  @ApiProperty({ description: 'Firebase Messaging Token' })
  fcmToken?: string;

  @Prop({ default: false })
  @ApiProperty({ description: 'Stories 회원 탈퇴' })
  deleted?: boolean;

  @Prop({ default: null })
  @ApiProperty({ description: '탈퇴일' })
  deletedAt?: Date;

  @Prop({ default: null })
  @ApiProperty({ description: '가입일' })
  createdAt?: Date;

  @Prop({ default: null })
  updatedAt?: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
