import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { HydratedDocument, SchemaTypes, Types } from 'mongoose';

export type UserCouponDocument = HydratedDocument<UserCoupon>;

@Schema({ timestamps: true })
export class UserCoupon {
  @Prop({ type: SchemaTypes.ObjectId })
  @ApiProperty({ description: '사용자 ID' })
  userId: Types.ObjectId;

  @Prop({ type: SchemaTypes.ObjectId })
  @ApiProperty({ description: '쿠폰 ID' })
  couponId: Types.ObjectId;
}

export const UserCouponSchema = SchemaFactory.createForClass(UserCoupon);
