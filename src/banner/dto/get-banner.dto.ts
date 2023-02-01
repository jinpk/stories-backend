import { ApiProperty, IntersectionType } from '@nestjs/swagger';
import { ListReqDto } from 'src/common/dto/request.dto';
import { BannerDto } from './banner.dto';
import { PagingReqDto } from 'src/common/dto/request.dto';

export class GetBannerDto extends PagingReqDto {
    @ApiProperty({
      required: false,
    })
    readonly title: string;
}
