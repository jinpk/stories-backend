import { OmitType } from '@nestjs/swagger';
import { LevelTestDto } from './leveltest.dto';

export class UpdateLevelTestDto extends OmitType(LevelTestDto, [
    'createdAt',
    'updatedAt',
] as const) {}