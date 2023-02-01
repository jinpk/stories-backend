import { ApiProperty, IntersectionType } from '@nestjs/swagger';
import { ListReqDto } from 'src/common/dto/request.dto';
import { PopupDto } from './popup.dto';
import { PagingReqDto } from 'src/common/dto/request.dto';

export class GetPopupDto extends PagingReqDto {
    @ApiProperty({
      required: false,
    })
    readonly title: string;
  }
