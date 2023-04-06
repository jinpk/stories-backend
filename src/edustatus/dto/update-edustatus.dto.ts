import { ApiProperty, OmitType } from '@nestjs/swagger';
import { EduStatusDto } from './edustatus.dto';

export class UpdateEduStatusDto extends OmitType(EduStatusDto, [
] as const) {}

export class UpdateEduCompleted {
    @ApiProperty({})
    level: string;

    @ApiProperty({})
    contentId: string;

    @ApiProperty({})
    contentsSerialNum: string;
}

export class ChangeSelectedLevelDto {
    @ApiProperty({})
    level: string;
}