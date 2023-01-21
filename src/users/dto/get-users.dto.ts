import { ApiProperty } from '@nestjs/swagger';
import { isEmail, isEmpty, isNotEmpty } from 'class-validator';

export class GetUsersDto {
  @ApiProperty({
    description: '뉴스레터 구독',
    enum: ['', '1', '0'],
    required: false,
  })
  newsletter: string;
}
