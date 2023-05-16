import { ApiProperty } from '@nestjs/swagger';

export class FaqBoardDto{
  @ApiProperty({})
  id?: string;

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
  id?: string;

  @ApiProperty({})
  category: string;

  @ApiProperty({})
  createdAt?: Date;
}