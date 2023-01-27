import { PickType } from '@nestjs/swagger';
import { Subscription } from '../schemas/subscription.schema';

export class VerifySubscriptionDto extends PickType(Subscription, [
  'transactionId',
  'productId',
  'os',
  'receiptData',
  'token',
  'couponId',
] as const) {}
