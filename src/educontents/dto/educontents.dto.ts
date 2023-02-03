import { ApiProperty } from '@nestjs/swagger';

export type ContentsType = "SERIES" | "ARTICLE"
export type QuizType = "MULTI" | "TILE" | "OX"
export type DetailType = "NORMAL" | "SEQUENCE"

export class SeperateSentence {
    @ApiProperty({})
    hint: string;

    @ApiProperty({})
    timeline: string;
}

export class ChoiceAnswer {
    @ApiProperty({})
    choice: string;

    @ApiProperty({})
    answer: string;
}

export class EduContentsDto{
    @ApiProperty({})
    contentsSerialNum: string;
  
    @ApiProperty({})
    level: string;
  
    @ApiProperty({})
    contentsType: ContentsType;
  
    @ApiProperty({})
    seriesSequence: string;
  
    @ApiProperty({})
    storySequence: string;
  
    @ApiProperty({})
    title: string;
  
    @ApiProperty({})
    vocabCount: number;
  
    @ApiProperty({})
    questionCount: number;

    @ApiProperty({})
    coverFilePath: string;
    
    @ApiProperty({})
    audioFilePath: string;
  
    @ApiProperty({})
    seperateSentence: SeperateSentence[];
}

export class ContentsQuizDto{
    @ApiProperty({})
    quizType: QuizType;
  
    @ApiProperty({})
    detailType: DetailType;
  
    @ApiProperty({})
    quiz: string;

    @ApiProperty({})
    example: string;

    @ApiProperty({})
    choiceAnswer: ChoiceAnswer[];
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

class Statics {
    @ApiProperty({
        description: '분단위로 저장',
    })
    total: number;

    @ApiProperty({})
    read: number;

    @ApiProperty({})
    correct_rate: number;

    @ApiProperty({})
    words: number;
}

class CompleteRate {
    @ApiProperty({})
    article: number;

    @ApiProperty({})
    story: number;
}

class LevelCompleteRate {
  @ApiProperty({})
  level: string;

  @ApiProperty({})
  completeRate: CompleteRate;
}

export class UserEduInfoDto{
    @ApiProperty({})
    first_level: string;
  
    @ApiProperty({})
    current_level: string;
  
    @ApiProperty({
      description: '개인 학습정보 통계 지표',
    })
    statics: Statics;
  
    @ApiProperty({})
    vocab: string;
  
    @ApiProperty({
      description: '레벨별 완료율',
    })
    level_complete_rate: LevelCompleteRate[];
  }