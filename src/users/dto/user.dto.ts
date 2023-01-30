import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsUppercase } from 'class-validator';
import { SubscriptionTypes } from 'src/subscriptions/enums';
import { UserStates } from '../enums';

export class UserEnumDto {
  @ApiProperty({
    description: `회원 구분 >
    \ntrial: 트라이얼,
    \ntrialEnd: 트라이얼 해지,
    \nsubscription: 구독중,
    \nsubscriptionEnd: 구독해지,
    \nend: 해지,
    \nnormal: 미구독,
    \ndeleted: 탈퇴`,
    enum: UserStates,
    required: false,
  })
  @IsOptional()
  @IsEnum(UserStates)
  userState: UserStates;

  @ApiProperty({
    description: `회원 구독중인 구독권 종류 >
    \nyear: 연간 구독
    \nmonth: 월간 구독`,
    enum: SubscriptionTypes,
    required: false,
  })
  @IsOptional()
  @IsEnum(SubscriptionTypes)
  subscriptionType: SubscriptionTypes;
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
  countryCode: string;

  @ApiProperty({
    description: 'TTMIK 멤버쉽 여부',
  })
  ttmik: boolean;

  @ApiProperty({
    description: '회원 탈퇴 여부',
  })
  deleted: boolean;

  @ApiProperty({
    description: '가입 날짜',
  })
  createdAt: Date;
}
