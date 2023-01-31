import { ApiProperty } from '@nestjs/swagger';

class Statics {
    @ApiProperty({
        description: '분단위로 저장',
    })
    total: number;

    @ApiProperty({})
    read: number;

    @ApiProperty({})
    correct_rate: number;

    @ApiProperty({})
    words: number;
}

class CompleteRate {
    @ApiProperty({})
    article: number;

    @ApiProperty({})
    story: number;
}

class LevelCompleteRate {
    @ApiProperty({})
    lv1: CompleteRate;
    @ApiProperty({})
    lv2: CompleteRate;
    @ApiProperty({})
    lv3: CompleteRate;
    @ApiProperty({})
    lv4: CompleteRate;
    @ApiProperty({})
    lv5: CompleteRate;
    @ApiProperty({})
    lv6: CompleteRate;
    @ApiProperty({})
    lv7: CompleteRate;
    @ApiProperty({})
    lv8: CompleteRate;
    @ApiProperty({})
    lv9: CompleteRate;
    @ApiProperty({})
    lv10: CompleteRate;
}

export class UserLevelTestDto{
  @ApiProperty({})
  first_level: string;

  @ApiProperty({})
  current_level: string;

  @ApiProperty({
    description: '개인 학습정보 통계 지표',
  })
  statics: Statics;

  @ApiProperty({})
  vocab: string;

  @ApiProperty({
    description: '레벨별 완료율',
  })
  level_complete_rate: LevelCompleteRate;
}

export class LevelTestDto{
    @ApiProperty({})
    contentsSerialNum: string;
  
    @ApiProperty({})
    level: string;
  
    @ApiProperty({})
    text: string;
  
    @ApiProperty({})
    answers: string[];
  
    @ApiProperty({})
    correct_answer: number;
  }