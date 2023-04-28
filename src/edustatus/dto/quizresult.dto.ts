import { ApiProperty } from '@nestjs/swagger';

export class QuizResultDto {
    @ApiProperty({})
    quizId: string;

    @ApiProperty({default: false})
    corrected: boolean;
}
