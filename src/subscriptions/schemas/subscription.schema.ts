import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { HydratedDocument, Types, SchemaTypes } from 'mongoose';
import { AppOS } from 'src/common/enums';
import { SubscriptionStates } from '../enums';

export type SubscriptionDocument = HydratedDocument<Subscription>;

@Schema({ timestamps: true })
export class Subscription {
  @Prop({ type: SchemaTypes.ObjectId })
  @ApiProperty({ description: '사용자 ID', type: String })
  userId: Types.ObjectId;

  @Prop()
  @ApiProperty({ description: '결제(주문) ID' })
  @IsNotEmpty()
  transactionId: string;

  @Prop({ enum: SubscriptionStates })
  @ApiProperty({ description: '구독 상태', enum: SubscriptionStates })
  @IsEnum(SubscriptionStates)
  @IsNotEmpty()
  state: string;

  @Prop()
  @ApiProperty({ description: '상품 ID (subscriptionId)' })
  @IsNotEmpty()
  productId: string;

  @Prop({ enum: AppOS })
  @ApiProperty({ description: 'OS', enum: AppOS })
  @IsNotEmpty()
  @IsEnum(AppOS)
  os: AppOS;

  @Prop()
  @ApiProperty({ description: 'IOS 결제 데이터', required: false })
  receiptData: string;

  @Prop()
  @ApiProperty({ description: 'Android 결제검증 Token', required: false })
  token: string;

  @Prop()
  @ApiProperty({ description: '유저 쿠폰 ID(첫 결제에서만)', required: false })
  userCouponId: string;

  @Prop({ default: null })
  @ApiProperty({ description: '주문 날짜' })
  createdAt?: Date;

  @Prop({ default: null })
  updatedAt?: Date;
}

export const SubscriptionSchema = SchemaFactory.createForClass(Subscription);
