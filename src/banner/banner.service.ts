import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  now,
  FilterQuery,
  Model,
  PipelineStage,
  ProjectionFields,
  Types,
} from 'mongoose';
import { PagingResDto } from 'src/common/dto/response.dto';
import { Banner, BannerDocument } from './schemas/banner.schema';
import { BannerDto } from './dto/banner.dto';
import { GetListBannerDto } from './dto/get-banner.dto';
import { UpdateBannerDto } from './dto/update-banner.dto';
import { UtilsService } from 'src/common/providers';

@Injectable()
export class BannerService {
  constructor(
    private utilsService: UtilsService,
    @InjectModel(Banner.name) private bannerModel: Model<BannerDocument>,
  ) {}

  async getBannerById(banner_id: string): Promise<BannerDocument | false> {
    const banner = await this.bannerModel.findById(banner_id);
    if (!banner) {
      return false;
    }

    return banner;
  }

  async createBanner(body: BannerDto): Promise<string> {
    var banner: Banner = new Banner();
    banner = {
      active: body.active,
      title: body.title,
      startDate: body.startDate,
      endDate: body.endDate,
      imageFilePath: body.imageFilePath,
      link: body.link,
    }
    const result = await new this.bannerModel(banner).save();
    return result._id.toString(); 
  }

  async existBanner(banner_id: string): Promise<boolean> {
    const banner = await this.bannerModel.findOne({banner_id});
    if (!banner) {
        return false
    }
      return true
  }

  async updateBanner(banner_id: string, body: UpdateBannerDto): Promise<string> {
    const result = await this.bannerModel.findByIdAndUpdate(banner_id, { 
      $set: {
        active: body.active,
        title: body.title,
        startDate: body.startDate,
        endDate: body.endDate,
        imageFilePath: body.imageFilePath,
        link: body.link,
        updatedAt: now()}
    });

    return result._id.toString();
  }

  async deleteBanner(banner_id: string): Promise<string> {
    await this.bannerModel.findByIdAndDelete(banner_id);
    return banner_id
  }

  async getPagingBanners(
    query: GetListBannerDto,
  ): Promise<PagingResDto<BannerDto> | Buffer> {
    var filter: FilterQuery<BannerDocument> = {}
    if (query.title != undefined) {
      filter.title = { $regex: query.title };
    }

    const projection: ProjectionFields<BannerDto> = {
      _id: 1,
      active: 1,
      title: 1,
      startDate: 1,
      endDate: 1,
      imageFilePath: 1,
      link: 1,
      createdAt: 1,
    };

    const cursor = await this.bannerModel.aggregate([
      { $match: filter },
      { $project: projection },
      { $sort: { createdAt: -1 } },
      this.utilsService.getCommonMongooseFacet(query),
    ]);

    const metdata = cursor[0].metadata;
    const data = cursor[0].data;

    return {
      total: metdata[0]?.total || 0,
      data: data,
    };
  }
}
