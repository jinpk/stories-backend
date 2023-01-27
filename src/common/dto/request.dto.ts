import { ApiProperty, IntersectionType } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

export class PagingReqDto {
  @ApiProperty({
    description: 'page',
    default: 1,
  })
  @IsNumber()
  page: number;

  @ApiProperty({
    description: 'limit',
    default: 10,
  })
  @IsNumber()
  limit: number;
}

export class SearchReqDto {
  @ApiProperty({
    description: '검색 대상',
    required: false,
  })
  readonly target: string;

  @ApiProperty({
    description: '검색 키워드',
    required: false,
  })
  readonly keyword: string;
}

export class PagingExcelReqDto extends PagingReqDto {
  @ApiProperty({
    description: '엑셀 다운로드',
    required: false,
    enum: ['', '0', '1'],
  })
  readonly excel: string;
}

export class ListReqDto extends IntersectionType(
  PagingExcelReqDto,
  SearchReqDto,
) {
  @ApiProperty({
    description: '조회 시작일',
    required: false,
  })
  readonly start: string;

  @ApiProperty({
    description: '조회 종료일',
    required: false,
  })
  readonly end: string;
}
