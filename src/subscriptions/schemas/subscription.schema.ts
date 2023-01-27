import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { HydratedDocument } from 'mongoose';
import { AppOS } from 'src/common/enums';

export type SubscriptionDocument = HydratedDocument<Subscription>;

@Schema({ timestamps: true })
export class Subscription {
  @Prop()
  @ApiProperty({ description: '결제(주문) ID' })
  @IsNotEmpty()
  transactionId: string;

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
  @ApiProperty({ description: '쿠폰 ID(첫 결제에서만)', required: false })
  couponId: string;

  @Prop({ default: null })
  @ApiProperty({ description: '주문 날짜' })
  createdAt?: Date;

  @Prop({ default: null })
  updatedAt?: Date;
}

export const SubscriptionSchema = SchemaFactory.createForClass(Subscription);
