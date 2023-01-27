import { OmitType } from '@nestjs/swagger';
import { CouponDto } from './coupon.dto';

export class UpdateCouponDto extends OmitType(CouponDto, [
  'createdAt',
  'id',
] as const) {}
