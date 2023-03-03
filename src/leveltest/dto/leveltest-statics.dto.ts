import { ApiProperty } from '@nestjs/swagger';

export class StaticsLevelTestDto {
  @ApiProperty({
    description: '레벨',
    required: false,
  })
  readonly level: string;

  @ApiProperty({
    description: '완료율 %',
    required: false,
  })
  readonly complete_rate: string;

  @ApiProperty({
    description: '회원 분포 %',
    required: false,
  })
  readonly user_rate: string;
}