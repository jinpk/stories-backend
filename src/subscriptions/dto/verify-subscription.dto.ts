import { ApiProperty, OmitType, PickType } from '@nestjs/swagger';
import { Subscription } from '../schemas/subscription.schema';

export class VerifySubscriptionDto extends OmitType(Subscription, [
  'orderId',
  'state',
  'createdAt',
  'histories',
] as const) {}
