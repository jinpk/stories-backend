import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsUppercase } from 'class-validator';
import { SubscriptionTypes } from 'src/subscriptions/enums';

enum UserState {
  All,
  Trial,
  TrialEnd,
  Subscription,
  SubscriptionEnd,
  End,
  Normal,
  Deleted,
}

export class UserEnumDto {
  @ApiProperty({
    description: `회원 구분 >
    \nAll: 전체,
    \nTrial: 트라이얼,
    \nTrialEnd: 트라이얼 해지,
    \nSubscription: 구독중,
    \nSubscriptionEnd: 구독해지,
    \nEnd: 해지,
    \nNormal: 미구독,
    \nDeleted: 탈퇴,
    `,
    enum: UserState,
    required: false,
  })
  @IsEnum(UserState)
  userState: UserState;

  @ApiProperty({
    description: `회원 구독중인 구독권 종류 >
    \nAll: 전체
    \nYear: 연간 구독
    \nMMonth: 월간 구독
    \nNone: 미구독
    `,
    enum: SubscriptionTypes,
    required: false,
  })
  @IsEnum(SubscriptionTypes)
  userSubscriptionType: SubscriptionTypes;
}

export class UserDto extends UserEnumDto {
  @ApiProperty({ description: 'userId' })
  id: string;

  @ApiProperty({})
  email: string;

  @ApiProperty({})
  name: string;

  @ApiProperty({})
  nickname: string;

  @ApiProperty({
    description: '뉴스레터 구독',
  })
  subNewsletter: boolean;

  @ApiProperty({
    description: '국가코드',
  })
  @IsUppercase()
  countryCode: string;

  @ApiProperty({
    description: 'TTMIK 멤버쉽 여부',
  })
  ttmik: boolean;

  @ApiProperty({
    description: '가입 날짜',
  })
  createdAt: Date;
}
