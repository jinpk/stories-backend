import { ApiProperty, IntersectionType } from '@nestjs/swagger';
import { PagingReqDto, PagingExcelReqDto } from 'src/common/dto/request.dto';
import { IsString } from 'class-validator';

export class StaticsVocabDto {
    @ApiProperty({
        default: 0,
      description: '추가 단어 수',
    })
    addedVocabCount: number;
  
    @ApiProperty({
        default: 0,
      description: '익힌 단어 수',
    })
    studiedVocabCount: number;
  
    @ApiProperty({
        default: 0,
      description: '완료율(익힌단어수/추가단어수) %',
    })
    completeRate: number;
  }

  export class Statics {
    id?: string;

    @ApiProperty({})
    userId: string;

    @ApiProperty({
        description: '분단위로 저장',
    })
    total: number;

    @ApiProperty({})
    read: number;

    @ApiProperty({})
    correctRate: number;

    @ApiProperty({})
    words: number;
}