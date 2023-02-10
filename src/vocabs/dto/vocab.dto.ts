import { ApiProperty } from '@nestjs/swagger';

export type PreviewVocabulary = 'ALL' | 'USE' | 'UNUSE'

export class VocabDto{
  @ApiProperty({})
  contentsSerialNum: string;

  @ApiProperty({})
  level: string;

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
  previewVocabulary: PreviewVocabulary;
}

export class CoreTypeUpdateDto{
  @ApiProperty({})
  previewVocabulary: PreviewVocabulary;
}

export class CoreVocabDto{
  @ApiProperty({})
  vocabId: string;

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
  reviewQuiz: boolean;
}

export class ReviewVocabDto{
  @ApiProperty({})
  vocabId: string;

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
  multiple: string[];
}