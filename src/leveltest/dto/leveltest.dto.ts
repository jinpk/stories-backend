import { ApiProperty } from '@nestjs/swagger';

export class LevelTestDto{
    @ApiProperty({})
    contentsSerialNum: string;
  
    @ApiProperty({})
    level: string;
  
    @ApiProperty({})
    text: string;
  
    @ApiProperty({})
    answers: string[];
  
    @ApiProperty({})
    correct_answer: number;
  }

  export class LevelTestResultDto{
    @ApiProperty({})
    correct_answer: number;
  
    @ApiProperty({})
    total_answer: number;
  }