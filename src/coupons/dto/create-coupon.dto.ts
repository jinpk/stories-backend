import { OmitType } from '@nestjs/swagger';
import { CouponDto } from './coupon.dto';

export class CreateCouponDto extends OmitType(CouponDto, [
  'createdAt',
  'id',
] as const) {}
