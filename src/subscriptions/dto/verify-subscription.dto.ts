import { PickType } from '@nestjs/swagger';
import { Subscription } from '../schemas/subscription.schema';

export class VerifySubscriptionDto extends PickType(Subscription, [
  'transactionId',
  'productId',
  'os',
  'userId',
  'receiptData',
  'token',
  'userCouponId',
] as const) {}
