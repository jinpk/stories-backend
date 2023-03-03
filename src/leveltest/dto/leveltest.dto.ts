import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class LevelTestDto{
  @ApiProperty({})
  @IsString()
  level: string;

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