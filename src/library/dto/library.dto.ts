import { ApiProperty } from '@nestjs/swagger';

export class Libraries{
  @ApiProperty({})
  contentsSerialNum: string;

  @ApiProperty({})
  contentsId: string;

  @ApiProperty({})
  title: string;

  @ApiProperty({})
  current: number;

  @ApiProperty({})
  total: number;

  @ApiProperty({})
  isBookmarked: boolean;

  @ApiProperty({})
  isCompleted: boolean;

  @ApiProperty({})
  highestLevel: string;
}

export class ListLibraryDto {
    @ApiProperty({})
    level: string;
    
    @ApiProperty({})
    series: CompleteCount;
  
    @ApiProperty({})
    article: CompleteCount;

    @ApiProperty({})
    libraries: Libraries[];
}

class CompleteCount {
    @ApiProperty({})
    complete: number;

    @ApiProperty({})
    total: number;    
}