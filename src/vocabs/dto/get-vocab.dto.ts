import { ApiProperty, IntersectionType } from '@nestjs/swagger';
import { ListReqDto } from 'src/common/dto/request.dto';
import { VocabDto, ContentsType, CoreType } from './vocab.dto';
import { PagingExcelReqDto } from 'src/common/dto/request.dto';

type VocabType = 'ADDED' | 'STUDIED'


export class GetVocabDto {
  @ApiProperty({
    required: false,
  })
  readonly id: string;
}

export class GetVocabsDto extends PagingExcelReqDto {
  @ApiProperty({
    required: false,
  })
  readonly vocab: string;

  @ApiProperty({
    required: false,
  })
  readonly level: string;

  @ApiProperty({
    description: 'SERIES or ARTICLE',
    required: false,
  })
  readonly contents_type: ContentsType;

  @ApiProperty({
    description: '본문 단어',
    required: false,
  })
  readonly contents_vocab: string;

  @ApiProperty({
    required: false,
  })
  readonly core_type: CoreType;
}

export class GetStaticsVocabDto extends PagingExcelReqDto {
  @ApiProperty({
    description: '평균 추가단어수 = ADDED, 익힌 단어수 = STUDIED',
    required: false,
  })
  readonly vocab_type: VocabType;

  @ApiProperty({
    description: '조회 시작일 (YYYY-MM-DD)',
    required: false,
  })
  readonly start: string;

  @ApiProperty({
    description: '조회 종료일 (YYYY-MM-DD',
    required: false,
  })
  readonly end: string;
}