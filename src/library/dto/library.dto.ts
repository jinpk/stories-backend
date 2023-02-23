import { ApiProperty } from '@nestjs/swagger';

class CompleteCount {
  @ApiProperty({})
  complete: number;

  @ApiProperty({})
  total: number;    
}

export class LibraryDto {
  @ApiProperty({})
  id: string;

  @ApiProperty({})
  contentsSerialNum: string;
  
  @ApiProperty({})
  level: string;
  
  @ApiProperty({})
  title: string;

  @ApiProperty({default: false})
  isCompleted: boolean;
}

export class ListLevelLibraryDto {
  @ApiProperty({})
  level: string;
  
  @ApiProperty({})
  series: CompleteCount;

  @ApiProperty({})
  article: CompleteCount;
}