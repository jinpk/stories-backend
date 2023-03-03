import { ApiProperty, IntersectionType } from '@nestjs/swagger';
import { PagingReqDto } from 'src/common/dto/request.dto';

export class GetListAudioPlayerDto {
  @ApiProperty({})
  readonly level: string;

  @ApiProperty({
    description: 'COMPLETE | SERIES | ARTICLE',
  })
  readonly filterType: string;

  @ApiProperty({
  })
  readonly bookmarked: boolean;
}