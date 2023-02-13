import { ApiProperty, IntersectionType } from '@nestjs/swagger';
import { VocabDto } from './vocab.dto';
import { PagingReqDto, PagingExcelReqDto } from 'src/common/dto/request.dto';

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
    description: '본문 단어',
    required: false,
  })
  readonly contents_vocab: string;
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

export class GetCoreVocabDto extends PagingReqDto{
  @ApiProperty({})
  contentsSerialNum: string
}