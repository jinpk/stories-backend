import { ApiProperty, OmitType, PickType } from '@nestjs/swagger';
import { CouponDto } from './coupon.dto';

export class UserCouponDto extends PickType(CouponDto, [
  'id',
  'name',
  'description',
  'type',
  'start',
  'value',
  'end',
] as const) {
  @ApiProperty({ description: '쿠폰 발급 ID' })
  userCouponId: string;

  @ApiProperty({ description: '회원 닉네임' })
  nickname: string;

  @ApiProperty({ description: '발송 날짜' })
  createdAt: Date;
}

export class CreateUserCouponDto {
  @ApiProperty()
  couponId: string;

  @ApiProperty({ description: '발송 회원 id list' })
  userIds: string[];
}
