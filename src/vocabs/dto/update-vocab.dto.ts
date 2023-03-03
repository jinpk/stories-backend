import { OmitType } from '@nestjs/swagger';
import { VocabDto } from './vocab.dto';

export class UpdateVocabDto extends OmitType(VocabDto, [
  'level',
  'title',
  'connStory',
  'createdAt',
  'updatedAt',
  'id'
] as const) {}

export class UpdateReviewVocabDto extends OmitType(VocabDto, [
  'level',
  'title',
  'connStory',
  'createdAt',
  'updatedAt',
  'id'
] as const) {}