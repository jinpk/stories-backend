import { ApiProperty, PickType } from '@nestjs/swagger';
import { Subscription } from '../schemas/subscription.schema';

export class VerifySubscriptionDto extends PickType(Subscription, [
  'transactionId',
  'productId',
  'os',
  'userId',
  'userCouponId',
] as const) {
  @ApiProperty({ description: '안드로이드 결제 Token' })
  token: string;

  @ApiProperty({ default: 'IOS 결제 영수증' })
  receiptData: string;
}
