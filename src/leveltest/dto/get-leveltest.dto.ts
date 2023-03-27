import { ApiProperty, IntersectionType } from '@nestjs/swagger';
import { ListReqDto } from 'src/common/dto/request.dto';
import { LevelTestDto } from './leveltest.dto';
import { PagingReqDto } from 'src/common/dto/request.dto';

export class GetPagingLevelTestDto extends PagingReqDto {
  @ApiProperty({
    required: false,
  })
  readonly step: string;
}
  
export class GetStaticsLevelTestDto {
  @ApiProperty({
    description: '조회 시작일 (YYYY-MM-DD)',
    required: false,
  })
  readonly start: string;

  @ApiProperty({
    description: '조회 종료일 (YYYY-MM-DD',
    required: false,
  })
  readonly end: string;
}