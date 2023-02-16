import { ApiProperty } from '@nestjs/swagger';

class CompleteCount {
    @ApiProperty({})
    complete: number;

    @ApiProperty({})
    total: number;    
}

export class LevelProgress {
    @ApiProperty({})
    level: string;

    @ApiProperty({})
    series: CompleteCount;

    @ApiProperty({})
    article: CompleteCount;
}

export class RecentSeries {
    @ApiProperty({})
    contentsId: string;

    @ApiProperty({})
    contentsSerialNum: string;

    @ApiProperty({})
    title: string;

    @ApiProperty({})
    current: number;

    @ApiProperty({})
    total: number;
}

export class RecentArticle {
    @ApiProperty({})
    contentsId: string;

    @ApiProperty({})
    contentsSerialNum: string;

    @ApiProperty({})
    title: string;
}

export class Statics {
    @ApiProperty({
        description: '분단위로 저장',
    })
    total: number;

    @ApiProperty({})
    read: number;

    @ApiProperty({})
    correctRate: number;

    @ApiProperty({})
    words: number;
}

class CompleteRate {
    @ApiProperty({})
    article: number;

    @ApiProperty({})
    story: number;
}

export class LevelCompleteRate {
  @ApiProperty({})
  level: string;

  @ApiProperty({})
  completeRate: CompleteRate;
}

export class EduStatusDto {
    @ApiProperty({})
    firstLevel: string;

    @ApiProperty({})
    highestLevel: string;

    @ApiProperty({})
    selectedLevel: string;

    @ApiProperty({})
    levelProgress: LevelProgress[];

    @ApiProperty({})
    recentSeries: RecentSeries;

    @ApiProperty({})
    recentArticle: RecentArticle;

    @ApiProperty({
    description: '개인 학습정보 통계 지표',
    default: {},
    })
    statics: Statics;

    @ApiProperty({
    description: '레벨별 완료율',
    })
    levelCompleteRate: LevelCompleteRate[];

    @ApiProperty({})
    userId: string;

}

export class LevelTestResultDto{
    @ApiProperty({})
    level: string
  }