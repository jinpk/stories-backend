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
    seriesCompleted: string[];

    @ApiProperty({})
    articleTotal: number;

    @ApiProperty({})
    articleCompleted: string[];

    @ApiProperty({})
    quizResult: QuizResult;

    @ApiProperty({})
    updatedAt: Date;
}

export class LevelProgress { 
}

export class RecentContent {
    @ApiProperty({})
    _id: string;

    @ApiProperty({})
    contentsSerialNum: string;

    @ApiProperty({})
    title: string;

    @ApiProperty({})
    content: string;

    @ApiProperty({})
    seriesNum: number;

    @ApiProperty({})
    storyIndex: number;

    @ApiProperty({})
    imagePath: string;
}

export class EduStatusDto {
    id?: string;

    @ApiProperty({})
    userId: string;

    @ApiProperty({})
    firstLevel: string;

    @ApiProperty({})
    latestLevel: string;

    @ApiProperty({})
    selectedLevel: string;

    // @ApiProperty({})
    // levelProgress: LevelProgress;

    // @ApiProperty({})
    // recentSeries: RecentSeries;

    // @ApiProperty({})
    // recentArticle: RecentArticle;

    // @ApiProperty({
    // description: '개인 학습정보 통계 지표',
    // default: {},
    // })
    // statics: Object;

    @ApiProperty({})
    updateAt?: Date;
}


export class HomeInfoDto {
    id?: string;

    @ApiProperty({})
    userId: string;

    @ApiProperty({})
    selectedLevel: string;

    @ApiProperty({})
    seriesTotal: number;

    @ApiProperty({})
    articleTotal: number;

    @ApiProperty({})
    seriesCompleted: number;

    @ApiProperty({})
    articleCompleted: number;

    @ApiProperty({})
    recentSeries: RecentContent;

    @ApiProperty({})
    recentArticle: RecentContent;

    @ApiProperty({})
    updateAt?: Date;
}

export class CertificateDto {
    @ApiProperty({})
    level: string;

    @ApiProperty({})
    completion: boolean;
}

export class CertificateDetailDto {
    @ApiProperty({})
    level: string;

    @ApiProperty({})
    completion: boolean;
    
    @ApiProperty({})
    completedAt: Date;
}