import { ApiProperty } from '@nestjs/swagger';

export type ContentsType = "SERIES" | "ARTICLE"
export type CoreType = 'ALL' | 'USE' | 'UNUSE'

export class VocabDto{
  @ApiProperty({})
  contentsSerialNum: string;

  @ApiProperty({})
  level: string;

  @ApiProperty({
    description: 'SERIES or ARTICLE',
  })
  contents_type: ContentsType;

  @ApiProperty({
    description: '연결된 스토리',
  })
  story: string;

  @ApiProperty({})
  vocab: string;

  @ApiProperty({
    description: '오디오 파일 저장 경로',
  })
  audio_file_path: string;

  @ApiProperty({
    description: '연결된 컨텐츠 문장',
  })
  sentence: string;

  @ApiProperty({})
  value: string;

  @ApiProperty({})
  meaning_en: string;

  @ApiProperty({})
  core_type: CoreType;
}

export class CoreTypeUpdateDto{
  @ApiProperty({})
  core_type: CoreType;
}
