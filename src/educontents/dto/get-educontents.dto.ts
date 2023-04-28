import { ApiProperty, IntersectionType } from '@nestjs/swagger';
import { EduContentsDto } from './educontents.dto';
import { PagingReqDto, PagingExcelReqDto } from 'src/common/dto/request.dto';

export class GetEduContentsDto {
  @ApiProperty({
    required: false,
  })
  readonly id: string;
}

export class GetListEduContentsDto extends PagingExcelReqDto {
  @ApiProperty({
    required: false,
  })
  readonly level: string;

  @ApiProperty({
    required: false,
  })
  readonly title: string;

  @ApiProperty({
    description: 'SERIES or ARTICLE',
    required: false,
  })
  readonly contentType: string;

  @ApiProperty({
    description: '시리얼 번호',
    required: false,
  })
  readonly contentsSerialNum: string;
}

export class GetListQuizDto extends PagingReqDto {
}

export class GetListBookmarkDto extends PagingReqDto {
}
