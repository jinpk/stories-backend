import { OmitType } from '@nestjs/swagger';
import { FaqBoardDto, FaqCategoryDto } from './faqboard.dto';

export class UpdateFaqBoardDto extends OmitType(FaqBoardDto, [
    'createdAt',
] as const) {}

export class UpdateFaqCategoryDto extends OmitType(FaqCategoryDto, [
    'createdAt',
] as const) {}