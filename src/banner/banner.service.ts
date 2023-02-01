import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Banner, BannerDocument } from './schemas/banner.schema';

@Injectable()
export class BannerService {
    constructor(
        @InjectModel(Banner.name) private bannerModel: Model<BannerDocument>,
      ) {}
    
      async GetVocab(banner_id: string): Promise<BannerDocument | false> {
        const banner = await this.bannerModel.findById(banner_id);
        if (!banner) {
          return false;
        }
        return banner;
      }
}
