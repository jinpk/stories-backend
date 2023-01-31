import { ApiProperty, IntersectionType } from '@nestjs/swagger';
import { ListReqDto } from 'src/common/dto/request.dto';
import { FaqBoardDto } from './faqboard.dto';
import { PagingExcelReqDto } from 'src/common/dto/request.dto';

export class GetFaqBoardDto extends PagingExcelReqDto {
    @ApiProperty({
      required: false,
    })
    readonly category: string;
  }
  
export class GetFaqCategoryDto {
}