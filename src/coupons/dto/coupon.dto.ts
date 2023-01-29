import { ApiProperty } from '@nestjs/swagger';

export class CouponDto {
  @ApiProperty({ description: '쿠폰 ID' })
  id: string;

  @ApiProperty({ description: '쿠폰명' })
  name: string;

  @ApiProperty()
  description: string;

  @ApiProperty({ enum: ['percent', 'amount', 'period'] })
  type: string;

  @ApiProperty({ description: 'type value' })
  value: number;

  @ApiProperty({ description: '유효기간 시작일' })
  start: Date;

  @ApiProperty({ description: '유효기간 종료일' })
  end: Date;

  @ApiProperty({ description: '쿠폰 생성일' })
  createdAt: Date;
}
