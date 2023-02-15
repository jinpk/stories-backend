import { ApiProperty } from '@nestjs/swagger';
// import { ContentsType} from './educontents.dto';

class StartTime {
    @ApiProperty({})
    minute: number;

    @ApiProperty({})
    seconds: number;
}

export class AudioPlayerDto{
    @ApiProperty({})
    level: string;

    @ApiProperty({})
    contentsId: string;

    // @ApiProperty({})
    // contentType: ContentsType;

    @ApiProperty({})
    title: string;

    @ApiProperty({})
    current: number;

    @ApiProperty({})
    total: number;
    
    @ApiProperty({})
    audioFilePath: string;

    @ApiProperty({})
    script: string;

    @ApiProperty({})
    startTime: StartTime;
}