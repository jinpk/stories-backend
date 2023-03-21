import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';
import { PagingReqDto } from 'src/common/dto/request.dto';

export class GetListAudioPlayerDto {
  @ApiProperty({})
  @IsString()
  readonly level: string;

  @ApiProperty({
    description: 'COMPLETE | SERIES | ARTICLE',
  })
  @IsString()
  readonly filterType: string;

  @ApiProperty({
    default: false
  })
  readonly bookmarked: boolean;
}