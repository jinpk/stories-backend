import { OmitType } from '@nestjs/swagger';
import { BannerDto } from './banner.dto';

export class UpdateBannerDto extends OmitType(BannerDto, [
    'createdAt',
] as const) {}