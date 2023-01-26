import { ApiProperty } from '@nestjs/swagger';
import { IsUppercase } from 'class-validator';

export class UserDto {
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

export class GetUserDto {
  @ApiProperty({
    required: false,
  })
  readonly id: string;
}

export class GetUsersDto {
  @ApiProperty({
    description: '뉴스레터 구독',
    enum: ['', '1', '0'],
    required: false,
  })
  readonly newsletter: string;
}
