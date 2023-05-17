import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { HydratedDocument, Types, SchemaTypes } from 'mongoose';
import { AppOS } from 'src/common/enums';
import { SubscriptionStates } from '../enums';

export type SubscriptionDocument = HydratedDocument<Subscription>;

@Schema({ timestamps: true })
export class SubscriptionHistory {
  // TODO: 기능 구현에 맟줘 스키마 정의 필요
  @Prop({ default: null })
  createdAt?: Date;
}

export const SubscriptionHistorySchema =
  SchemaFactory.createForClass(SubscriptionHistory);

@Schema({ timestamps: true })
export class Subscription {
  // 구독결제 오너
  @Prop({ type: SchemaTypes.ObjectId })
  @ApiProperty({ description: '사용자 ID', type: String })
  userId: Types.ObjectId;

  // 플레이 앱스토어 API 요청해서 받을 수 있음
  // 고유 주문 ID CS용
  @Prop()
  @ApiProperty({ description: '주문 ID' })
  @IsNotEmpty()
  orderId: string;

  // 결제 주문한 상품 ID
  @Prop()
  @ApiProperty({ description: '상품 ID (subscriptionId)' })
  @IsNotEmpty()
  productId: string;

  // 안드로이드 결제 토큰
  @Prop()
  @ApiProperty({ description: 'PlayStore 결제 검증 토큰<br/>안드로이드 필수' })
  purchaseToken?: string;

  // ios 결제 토큰
  @Prop()
  @ApiProperty({ default: 'IOS 결제 영수증<br/>iOS 필수' })
  receiptData?: string;

  // 해당 인앱결제 구독의 쿠폰 ID
  @Prop()
  @ApiProperty({
    description: '유저 쿠폰 ID(첫 결제에서만 보내면 됨.)',
    required: false,
  })
  userCouponId?: string;

  // 해당 구독 최종 상태
  // 구독의 상세 관리는 각 token을 이용하여 관리 가능하고
  // 이 컬럼은 엔드유저 입장에서 내가 구독중인지 아닌지 체크하는 것임.
  // 예로 구독을 취소했거나 결제 실패로 취소된 경우 expired로 업데이트
  // 정상 결제 및 구독 기간이 남았다면 active
  @Prop({ enum: SubscriptionStates })
  @ApiProperty({ description: '구독 상태', enum: SubscriptionStates })
  @IsEnum(SubscriptionStates)
  @IsNotEmpty()
  state: SubscriptionStates;

  @Prop({ enum: AppOS })
  @ApiProperty({ description: 'OS', enum: AppOS })
  @IsNotEmpty()
  @IsEnum(AppOS)
  os: AppOS;

  // 구독 첫 가입 날짜
  @Prop({ default: null })
  @ApiProperty({ description: '구독 가입 날짜' })
  createdAt?: Date;

  // 구독 매달 결제, 상태 관리 로깅을 위한 스키마
  @Prop({ default: [], type: [SubscriptionHistorySchema] })
  histories: [SubscriptionHistory];
}

export const SubscriptionSchema = SchemaFactory.createForClass(Subscription);
