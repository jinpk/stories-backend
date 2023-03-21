import { ApiProperty, OmitType } from '@nestjs/swagger';
import { EduStatusDto, Completed } from './edustatus.dto';

export class UpdateEduStatusDto extends OmitType(EduStatusDto, [
] as const) {}

export class UpdateEduCompleted extends Completed {
    @ApiProperty({})
    level: string;
}