import { ApiProperty } from '@nestjs/swagger';

export class VocabDto {
  @ApiProperty({})
  contentsSerialNum: string;

  @ApiProperty({})
  vocab: string;

  @ApiProperty({})
  meaning_en: string;

  @ApiProperty({})
  value: string;

  @ApiProperty({
    description: '컨텐츠 문장',
  })
  cont_sentence: string;

  @ApiProperty({})
  authFilePath: string;
}
