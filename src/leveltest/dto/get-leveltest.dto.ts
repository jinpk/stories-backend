import { ApiProperty, IntersectionType } from '@nestjs/swagger';
import { ListReqDto } from 'src/common/dto/request.dto';
import { LevelTestDto } from './leveltest.dto';
import { PagingReqDto } from 'src/common/dto/request.dto';

export class GetLevelTestDto {
    @ApiProperty({
      required: false,
    })
    readonly id: string;
  }
  
export class GetLevelTestsDto extends PagingReqDto {
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