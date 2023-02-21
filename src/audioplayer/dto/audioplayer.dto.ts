import { ApiProperty } from '@nestjs/swagger';

export class AudioPlayerDto{
    @ApiProperty({})
    contentsSerialNum: string;

    @ApiProperty({})
    level: string;

    @ApiProperty({})
    title: string;

    @ApiProperty({})
    content: string;

    @ApiProperty({})
    audioFilePath: string;
}