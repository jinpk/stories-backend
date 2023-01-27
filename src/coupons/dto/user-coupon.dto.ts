import { ApiProperty, OmitType } from '@nestjs/swagger';
import { Coupon } from '../schemas/coupon.schema';
import { CouponDto } from './coupon.dto';

export class UserCouponDto {
  @ApiProperty()
  id: string;

  @ApiProperty({ description: '회원 명' })
  nickname: string;

  @ApiProperty({ type: Coupon })
  coupon: CouponDto;

  @ApiProperty({ description: '발송 날짜' })
  createdAt: Date;
}

export class CreateUserCouponDto {
  @ApiProperty()
  couponId: string;

  @ApiProperty({ description: '발송 회원 id list' })
  userIds: string[];
}
