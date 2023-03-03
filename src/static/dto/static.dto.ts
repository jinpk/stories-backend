import { ApiProperty, IntersectionType } from '@nestjs/swagger';
import { PagingReqDto, PagingExcelReqDto } from 'src/common/dto/request.dto';
import { IsString } from 'class-validator';

export class StaticsVocabDto {
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