import { ApiProperty } from '@nestjs/swagger';

export class SendEmailDto {
  @ApiProperty({
    description: '받는 사람 주소 리스트',
  })
  addrs: string[];

  @ApiProperty({
    description: '메일 제목',
  })
  subject: string;

  @ApiProperty({
    description: '메일 내용',
  })
  data: string;

  @ApiProperty({
    description: '메일 내용 유형',
  })
  dataType: 'html' | 'text';
}
