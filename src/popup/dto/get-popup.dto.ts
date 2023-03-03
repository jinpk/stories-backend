import { ApiProperty, IntersectionType } from '@nestjs/swagger';
import { PagingReqDto } from 'src/common/dto/request.dto';

export class GetListPopupDto extends PagingReqDto {
    @ApiProperty({
      required: false,
    })
    readonly title: string;
  }

