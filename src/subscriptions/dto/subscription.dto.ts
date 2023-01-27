import { ApiProperty, OmitType } from '@nestjs/swagger';
import { Subscription } from '../schemas/subscription.schema';

export class SubscriptionsDto extends OmitType(Subscription, [
  'receiptData',
  'token',
] as const) {
  @ApiProperty({})
  id: string;

  @ApiProperty({})
  nickname: string;

  @ApiProperty({})
  email: string;

  @ApiProperty({})
  couponName: string;

  @ApiProperty({})
  remaningDay: string;

  @ApiProperty({})
  countryCode: string;
}
