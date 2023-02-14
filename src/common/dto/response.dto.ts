import { ApiProperty } from '@nestjs/swagger';

export class PagingResDto<T> {
  data: T[];
  @ApiProperty({
    description: 'total',
  })
  total: number;
}

export class ReviewVocabPagingResDto<T> {
  data: T[];
  @ApiProperty({
    description: 'total',
  })
  total: number;

  completed: number;
}

