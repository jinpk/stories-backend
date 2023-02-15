import { ApiProperty } from '@nestjs/swagger';

export type QuizType = "MC" | "TN" | "OX"
export type DetailType = "NORMAL" | "SEQUENCE"

export class TimeLine {
    @ApiProperty({})
    time: string;

    @ApiProperty({})
    sentence: string;
}

export class EduContentsDto{
  @ApiProperty({})
  id: string;

  @ApiProperty({})
  contentsSerialNum: string;
  
  @ApiProperty({})
  level: string;
  
  @ApiProperty({})
  title: string;

  @ApiProperty({})
  content: string;

  @ApiProperty({})
  vocabCount: number;

  @ApiProperty({})
  questionCount: number;

  @ApiProperty({})
  imagePath: string;
  
  @ApiProperty({})
  audioFilePath: string;

  @ApiProperty({
    description: "format: [{'time': '0:23', 'sentence': 'example'}]"
  })
  timeLine: TimeLine[];
}

export class ContentsQuizDto{
  @ApiProperty({})
  contentsSerialNum: string;

  @ApiProperty({})
  quizType: string;

  @ApiProperty({})
  question: string;

  @ApiProperty({})
  passage: string;

  @ApiProperty({})
  answer: string[];

  @ApiProperty({})
  options: string[];
}

export class ContentsQuizResultDto{
  @ApiProperty({})
  storyRead: string;

  @ApiProperty({})
  correctAnswer: number;

  @ApiProperty({})
  total: number;

  @ApiProperty({})
  nextContentsId: string;
}

export class UploadContentsDto{
  @ApiProperty({})
  total: number;
}

export class BookmarkDto{
  @ApiProperty({})
  userId: string;

  @ApiProperty({})
  eduContentsId: string;
}