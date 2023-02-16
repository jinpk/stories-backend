import { OmitType } from '@nestjs/swagger';
import { PopupDto } from './popup.dto';

export class UpdatePopupDto extends OmitType(PopupDto, [
    'createdAt',
] as const) {}