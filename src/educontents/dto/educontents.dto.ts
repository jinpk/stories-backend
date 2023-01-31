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