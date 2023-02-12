import { ApiProperty, OmitType } from '@nestjs/swagger';
import { Coupon } from '../schemas/coupon.schema';

export class CouponDto extends OmitType(Coupon, [
  'deleted',
  'deletedAt',
  'updatedAt',
]) {
  @ApiProperty({ description: '쿠폰 ID' })
  id: string;

  @ApiProperty({ description: '총 사용 횟수' })
  usedCount: number;
}
