import { ApiProperty } from '@nestjs/swagger';

class CompleteCount {
    @ApiProperty({})
    complete: number;

    @ApiProperty({})
    total: number;

    @ApiProperty({})
    updatedAt: Date;
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

    @ApiProperty({})
    current: number;

    @ApiProperty({})
    total: number;
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

class Completed {
    @ApiProperty({})
    article: string[];

    @ApiProperty({})
    story: string[];
}

export class LevelCompleted {
  @ApiProperty({})
  level: string;

  @ApiProperty({})
  completed: Completed;
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
    description: '레벨별 완료 한 array',
    })
    levelCompleted: LevelCompleted[];

    @ApiProperty({})
    userId: string;

}

export class LevelTestResultDto{
    @ApiProperty({})
    level: string;

    @ApiProperty({})
    updatedAt: Date;
  }