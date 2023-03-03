import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { HydratedDocument, Types, SchemaTypes } from 'mongoose';
import { AppOS } from 'src/common/enums';
import { SubscriptionStates } from '../enums';

export type SubscriptionDocument = HydratedDocument<Subscription>;

@Schema({ timestamps: true })
class VerifiedResult {
  @Prop({ type: String })
  data: any;
  @Prop({ default: null })
  createdAt?: Date;
}

export const SubscriptionVerifiedResult =
  SchemaFactory.createForClass(VerifiedResult);

@Schema({ timestamps: true })
export class Subscription {
  @Prop({ type: SchemaTypes.ObjectId })
  @ApiProperty({ description: '사용자 ID', type: String })
  userId: Types.ObjectId;

  @Prop()
  @ApiProperty({ description: '구독 ID = orderId' })
  @IsNotEmpty()
  transactionId: string;

  @Prop()
  @ApiProperty({
    description: '유저 쿠폰 ID(첫 결제에서만 보내면 됨.)',
    required: false,
  })
  userCouponId: string;

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

  @Prop({ default: [], type: [SubscriptionVerifiedResult] })
  verifiedResults: [VerifiedResult];

  @Prop({ default: null })
  @ApiProperty({ description: '주문 날짜' })
  createdAt?: Date;
}

export const SubscriptionSchema = SchemaFactory.createForClass(Subscription);
