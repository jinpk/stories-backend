import { ApiProperty, IntersectionType } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { ListReqDto } from 'src/common/dto/request.dto';
import { ExistQueryFields } from '../enums';
import { UserEnumDto } from '../../users/dto/user.dto';

export class ExistUserDto {
  @ApiProperty({
    description: '조회 대상',
    enum: ExistQueryFields,
  })
  @IsNotEmpty()
  @IsEnum(ExistQueryFields)
  readonly field: string;

  @ApiProperty({
    description: '조회 대상 검색값',
  })
  @IsNotEmpty()
  readonly value: string;
}

export class GetUsersDto extends IntersectionType(UserEnumDto, ListReqDto) {
  @ApiProperty({
    description: '뉴스레터 구독',
    required: false,
    enum: ['', '0', '1'],
  })
  readonly newsletter: string;

  @ApiProperty({
    description: '국가코드',
    required: false,
  })
  readonly countryCode: string;

  @ApiProperty({
    description: 'ttmik 멤버쉽 여부',
    enum: ['', '0', '1'],
    required: false,
  })
  readonly ttmik: string;
}
