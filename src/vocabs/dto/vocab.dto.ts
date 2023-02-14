import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export type PreviewVocabulary = 'Y' | 'N';

export class VocabDto{
  @ApiProperty({})
  @IsString()
  id: string;

  @ApiProperty({})
  @IsString()
  contentsSerialNum: string;

  @ApiProperty({})
  @IsString()
  level: string;

  @ApiProperty({})
  @IsString()
  title: string;

  @ApiProperty({
    description: '연결된 스토리',
  })
  @IsString()
  connStory: string;

  @ApiProperty({})
  @IsString()
  vocab: string;

  @ApiProperty({
    description: '오디오 파일 저장 경로',
  })
  @IsString()
  audioFilePath: string;

  @ApiProperty({
    description: '연결된 컨텐츠 문장',
  })
  @IsString()
  connSentence: string;

  @ApiProperty({})
  @IsString()
  value: string;

  @ApiProperty({})
  @IsString()
  meaningEn: string;

  @ApiProperty({})
  @IsString()
  previewVocabulary: PreviewVocabulary;

  @ApiProperty({})
  createdAt?: Date;

  @ApiProperty({})
  updatedAt?: Date;
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
  @IsString()
  id: string;

  @ApiProperty({})
  @IsString()
  vocabId: string;

  @ApiProperty({})
  @IsString()
  vocab: string;

  @ApiProperty({
    description: '오디오 파일 저장 경로',
  })
  @IsString()
  audioFilePath: string;

  @ApiProperty({
    description: '연결된 컨텐츠 문장',
  })
  @IsString()
  connSentence: string;

  @ApiProperty({})
  @IsString()
  value: string;

  @ApiProperty({})
  @IsString()
  meaningEn: string;
}