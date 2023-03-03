import { ApiProperty, IntersectionType } from '@nestjs/swagger';
import { IsNumberString } from 'class-validator';
import { PagingReqDto } from 'src/common/dto/request.dto';

export class GetListUserLibraryDto{
  @ApiProperty({})
  readonly bookmarked: boolean;

  @ApiProperty({
    default: "0"
  })
  @IsNumberString()
  readonly level: string;
}