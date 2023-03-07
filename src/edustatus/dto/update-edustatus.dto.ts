import { OmitType } from '@nestjs/swagger';
import { EduStatusDto } from './edustatus.dto';

export class UpdateEduStatusDto extends OmitType(EduStatusDto, [
] as const) {}