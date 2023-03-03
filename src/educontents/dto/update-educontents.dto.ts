import { OmitType } from '@nestjs/swagger';
import { EduContentsDto, ContentsQuizDto } from './educontents.dto';

export class UpdateEduContentsDto extends OmitType(EduContentsDto, [
] as const) {}

export class UpdateQuizsDto extends OmitType(ContentsQuizDto, [
] as const) {}