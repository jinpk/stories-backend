import { ApiProperty } from '@nestjs/swagger';

export class FaqBoardDto{
    @ApiProperty({})
    categoryId: string;
  
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