import { ApiProperty, IntersectionType } from '@nestjs/swagger';
import { EduContentsDto, ContentsType} from './educontents.dto';
import { PagingExcelReqDto } from 'src/common/dto/request.dto';

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
  readonly contentsType: ContentsType;

  @ApiProperty({
    description: '본문 단어',
    required: false,
  })
  readonly contentsSerialNum: string;
}

export class GetListQuizDto extends PagingExcelReqDto {
}

export class GetContentsQuizResultDto{
  @ApiProperty({})
  level: string;

  @ApiProperty({})
  contentsId: string;
}
