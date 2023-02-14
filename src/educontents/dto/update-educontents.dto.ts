import { OmitType } from '@nestjs/swagger';
import { EduContentsDto } from './educontents.dto';

export class UpdateEduContentsDto extends OmitType(EduContentsDto, [
] as const) {}