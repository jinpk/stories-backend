import { ApiProperty } from '@nestjs/swagger';

export class AudioPlayerDto{
    id?: string;

    @ApiProperty({})
    contentsId: string;
  
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

    @ApiProperty({})
    imagePath: string;
    
}