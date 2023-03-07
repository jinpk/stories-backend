import { ApiProperty } from '@nestjs/swagger';
import { now } from 'mongoose';

export class QuizResult {
    @ApiProperty({})
    correct: number;

    @ApiProperty({})
    total: number;
}

export class LevelProgressDetail {
    @ApiProperty({})
    seriesTotal: number;

    @ApiProperty({})
    seriesComplete: number;

    @ApiProperty({})
    articleTotal: number;

    @ApiProperty({})
    articleComplete: number;

    @ApiProperty({})
    quizResult: QuizResult;

    @ApiProperty({})
    updatedAt: Date;
}

export class LevelProgress { 
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

export class Completed {
    @ApiProperty({})
    articleCompleted: string[];
  
    @ApiProperty({})
    seriesCompleted: string[];
}

export class LevelCompleted {
}

export class CurrentLevel {
    @ApiProperty({})
    level: string;

    @ApiProperty({})
    total: number;

    @ApiProperty({})
    completed: number;

    @ApiProperty({default: now()})
    updatedAt?: Date;
}

export class EduStatusDto {
    @ApiProperty({})
    firstLevel: string;

    @ApiProperty({})
    currentLevel: CurrentLevel;

    @ApiProperty({})
    levelProgress: LevelProgress;

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
    levelCompleted: LevelCompleted;

    @ApiProperty({})
    userId: string;

    @ApiProperty({})
    updateAt?: Date;
}

export class LevelTestResultDto{
    @ApiProperty({})
    level: string;

    @ApiProperty({})
    correct: number;

    @ApiProperty({})
    total: number;

    @ApiProperty({})
    updatedAt: Date;
  }

export class CertificateDto {
    @ApiProperty({})
    level: string;

    @ApiProperty({})
    completion: boolean;
}