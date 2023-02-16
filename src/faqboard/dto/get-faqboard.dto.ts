import { ApiProperty, IntersectionType } from '@nestjs/swagger';
import { PagingReqDto } from 'src/common/dto/request.dto';

export class GetListFaqBoardDto extends PagingReqDto {
    @ApiProperty({
      required: false,
    })
    readonly category: string;
  }
  
export class GetListFaqCategoryDto extends PagingReqDto {
}