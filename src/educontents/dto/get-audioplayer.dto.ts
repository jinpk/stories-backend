import { ApiProperty, IntersectionType } from '@nestjs/swagger';
import { EduContentsDto } from './educontents.dto';
import { PagingExcelReqDto } from 'src/common/dto/request.dto';



export class GetListAudioPlayerDto extends PagingExcelReqDto {
  @ApiProperty({
    required: false,
  })
  readonly level: string;

  @ApiProperty({
    description: 'COMPLETE | SERIES | ARTICLE',
    required: false,
  })
  readonly filterType: string;
}