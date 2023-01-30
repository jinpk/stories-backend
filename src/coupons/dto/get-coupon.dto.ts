import { ApiProperty } from '@nestjs/swagger';
import { PagingExcelReqDto } from 'src/common/dto/request.dto';

export class GetCouponsDto extends PagingExcelReqDto {
  @ApiProperty({
    required: false,
    description: '쿠폰명',
    default: '',
  })
  readonly name: string;
}

export class GetCouponsSentDto extends GetCouponsDto {
  @ApiProperty({
    required: false,
  })
  readonly userId: string;
}
