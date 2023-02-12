import { ApiProperty, IntersectionType } from '@nestjs/swagger';
import { IsDateString, IsNumberString, IsOptional } from 'class-validator';

export class PagingReqDto {
  @ApiProperty({
    description: 'page',
    default: 1,
  })
  @IsNumberString()
  page: string;

  @ApiProperty({
    description: 'limit',
    default: 10,
  })
  @IsNumberString()
  limit: string;
}

export class SearchReqDto {
  @ApiProperty({
    description: '검색 대상\n각 API Dto의 field를 사용',
    required: false,
  })
  readonly target: string;

  @ApiProperty({
    description: '검색 키워드',
    required: false,
  })
  readonly keyword: string;
}

export class DateReqDto {
  @ApiProperty({
    description: '조회 시작일 (YYYY-MM-DD)',
    required: false,
  })
  @IsDateString()
  @IsOptional()
  readonly start: string;

  @ApiProperty({
    description: '조회 종료일 (YYYY-MM-DD)',
    required: false,
  })
  @IsDateString()
  @IsOptional()
  readonly end: string;
}

export class PagingExcelReqDto extends PagingReqDto {
  @ApiProperty({
    description: '엑셀 다운로드 (only "1" is true)',
    required: false,
    enum: ['', '1'],
  })
  readonly excel: string;
}

export class PagingExcelDateReqDto extends IntersectionType(
  PagingExcelReqDto,
  DateReqDto,
) {}

export class ListReqDto extends IntersectionType(
  PagingExcelDateReqDto,
  SearchReqDto,
) {}
