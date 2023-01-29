import { ApiProperty, IntersectionType, PickType } from '@nestjs/swagger';
import { ArrayNotEmpty } from 'class-validator';
import { UserCoupon } from '../schemas/user-coupon.schema';
import { CouponDto } from './coupon.dto';

export class UserCouponDto extends PickType(
  IntersectionType(CouponDto, UserCoupon),
  [
    'id',
    'name',
    'description',
    'type',
    'start',
    'value',
    'end',
    'subscriptionId',
    'userId',
  ] as const,
) {
  @ApiProperty({ description: '쿠폰 발급 ID' })
  userCouponId: string;

  @ApiProperty({ description: '회원 닉네임' })
  nickname: string;

  @ApiProperty({ description: '발송 날짜' })
  createdAt: Date;
}

export class CreateUserCouponDto {
  @ApiProperty({ description: 'couponId' })
  couponId: string;

  @ApiProperty({ description: '발송 사용자 ID list' })
  @ArrayNotEmpty()
  userIds: string[];
}
