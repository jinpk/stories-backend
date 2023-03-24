import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class LevelTestDto{
  @ApiProperty({})
  @IsString()
  step: string;

  @ApiProperty({})
  @IsString()
  sequence: string;

  @ApiProperty({})
  @IsString()
  text: string;

  @ApiProperty({})
  answers: string[];

  @ApiProperty({})
  correct_answer: number;

  @ApiProperty({})
  createdAt?: Date;

  @ApiProperty({})
  updatedAt?: Date;
}

export class LevelTestResultDto{
  @ApiProperty({})
  step: string;

  @ApiProperty({})
  correct: number;

  @ApiProperty({})
  total: number;

  @ApiProperty({})
  updatedAt: Date;
}