import { ApiProperty } from '@nestjs/swagger';

class CompleteCount {
    @ApiProperty({})
    complete: number;

    @ApiProperty({})
    total: number;    
}

class LevelProgress {
    @ApiProperty({})
    level: string;

    @ApiProperty({})
    series: CompleteCount;

    @ApiProperty({})
    article: CompleteCount;
}

class RecentSeries {
    @ApiProperty({})
    contentsId: string;

    @ApiProperty({})
    serialNumber: string;

    @ApiProperty({})
    title: string;

    @ApiProperty({})
    current: number;

    @ApiProperty({})
    total: number;
}

class RecentArticle {
    @ApiProperty({})
    contentsId: string;

    @ApiProperty({})
    serialNumber: string;

    @ApiProperty({})
    title: string;
}

export class EduProgress {
    @ApiProperty({})
    highestLevel: string;

    @ApiProperty({})
    selectedLevel: string;

    @ApiProperty({})
    LevelProgress: LevelProgress[];

    @ApiProperty({})
    recentSeries: RecentSeries;

    @ApiProperty({})
    recentArticle: RecentArticle;
}