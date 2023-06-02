import { ApiProperty } from '@nestjs/swagger';
import { now } from 'mongoose';

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

    @ApiProperty({})
    recentArticleId: string;

    @ApiProperty({})
    recentSeriesId: string;

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
    curSeriesNumTotal: number;

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

export class EduInfoDto {
    @ApiProperty({})
    firstLevel: string;

    @ApiProperty({})
    currentLevel: string;
    
    @ApiProperty({})
    studiedTime: number;

    @ApiProperty({})
    read: number;

    @ApiProperty({})
    correctRate: number;
    
    @ApiProperty({})
    words: number;

    @ApiProperty({})
    levelProgress: Object;
}