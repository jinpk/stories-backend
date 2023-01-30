import { ApiProperty } from '@nestjs/swagger';
import { ContentsType } from './vocab.dto';

export class StaticsVocabDto {
  @ApiProperty({
    description: '레벨',
    required: false,
  })
  readonly level: string;

  @ApiProperty({
    description: '추가 단어 수',
    required: false,
  })
  readonly added_vocab_count: number;

  @ApiProperty({
    description: '익힌 단어 수',
    required: false,
  })
  readonly studied_vocab_count: number;

  @ApiProperty({
    description: '완료율(익힌단어수/추가단어수) %',
    required: false,
  })
  readonly complete_rate: string;
}