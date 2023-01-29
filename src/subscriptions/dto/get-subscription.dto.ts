import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsUppercase } from 'class-validator';
import { ListReqDto } from 'src/common/dto/request.dto';
import { SubscriptionTypes } from '../enums';

export class GetSubscriptionsDto extends ListReqDto {
  @ApiProperty({
    description: '구독 남은 날짜 start,end\n(ex: 1,31)',
    required: false,
  })
  remaningRange: string;

  @ApiProperty({
    description: '국가코드',
    required: false,
  })
  countryCode: string;

  @ApiProperty({
    description: `구독권 종류 >
    \nAll: 전체
    \nYear: 연간 구독
    \nMMonth: 월간 구독
    \nNone: 미구독
    `,
    enum: SubscriptionTypes,
    required: false,
  })
  @IsEnum(SubscriptionTypes)
  type: SubscriptionTypes;

  @ApiProperty({
    description: `userID (검색 사용자 특정)`,
    required: false,
  })
  userId: string;
}
