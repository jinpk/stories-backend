import { ApiProperty, IntersectionType } from '@nestjs/swagger';
import { ListReqDto } from 'src/common/dto/request.dto';
import { UserEnumDto } from './user.dto';

export class GetUserDto {
  @ApiProperty({
    required: false,
  })
  readonly id: string;
}
export class GetUsersDto extends ListReqDto {
  @ApiProperty({
    description: '국가코드',
    required: false,
  })
  readonly countryCode: string;
}

/*
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
*/
