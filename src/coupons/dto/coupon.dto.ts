import { ApiProperty } from '@nestjs/swagger';

export class CouponDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  description: string;

  @ApiProperty({ enum: ['percent', 'amount', 'period'] })
  type: string;

  @ApiProperty()
  start: Date;

  @ApiProperty({})
  end: Date;

  @ApiProperty({})
  createdAt: Date;
}
