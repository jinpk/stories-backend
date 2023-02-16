import { ApiProperty } from '@nestjs/swagger';

export class FaqBoardDto{
    @ApiProperty({})
    category: string;
  
    @ApiProperty({})
    question: string;
  
    @ApiProperty({})
    answer: string;

    @ApiProperty({})
    createdAt?: Date;
  }

export class FaqCategoryDto{
    @ApiProperty({})
    category: string;

    @ApiProperty({})
    createdAt?: Date;
}