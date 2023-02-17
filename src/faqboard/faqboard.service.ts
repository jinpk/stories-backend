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
import { FaqBoardDto, FaqCategoryDto } from './dto/faqboard.dto';
import { UpdateFaqBoardDto, UpdateFaqCategoryDto } from './dto/update-faqboard.dto';
import { GetListFaqBoardDto, GetListFaqCategoryDto } from './dto/get-faqboard.dto';
import { FaqBoard, FaqBoardDocument } from './schemas/faqboard.schema';
import { FaqCategory, FaqCategoryDocument } from './schemas/faqcategory.schema';
import { UtilsService } from 'src/common/providers';

@Injectable()
export class FaqboardService {
  constructor(
    private utilsService: UtilsService,
    @InjectModel(FaqBoard.name) private faqboardModel: Model<FaqBoardDocument>,
    @InjectModel(FaqCategory.name) private faqcategoryModel: Model<FaqCategoryDocument>,
  ) {}
  
  async GetFaqById(faqboard_id: string): Promise<FaqBoardDocument | false> {
    const faqboard = await this.faqboardModel.findById(faqboard_id);
    if (!faqboard) {
      return false;
    }
    return faqboard;
  }

  async createFaq(body: FaqBoardDto): Promise<string> {
    var faqboard: FaqBoard = new FaqBoard();
    faqboard = {
      category: body.category,
      question: body.question,
      answer: body.answer
    }
    const result = await new this.faqboardModel(faqboard).save();
    return result._id.toString(); 
  }

  async existFaqById(faqboard_id: string): Promise<boolean> {
    const faqboard = await this.faqboardModel.findById(faqboard_id);
    if (!faqboard) {
      return false;
    }
    return true;
  }

  async updateFaq(faqboard_id: string, body: UpdateFaqBoardDto): Promise<string> {
    const result = await this.faqboardModel.findByIdAndUpdate(faqboard_id, { 
      $set: {
        category: body.category,
        question: body.question,
        answer: body.answer,
        updatedAt: now()}
    });

    return result._id.toString();
  }

  async deleteFaq(faqboard_id: string): Promise<string> {
    await this.faqboardModel.findByIdAndDelete(faqboard_id);
    return faqboard_id
  }

  async getPagingFaqs(
    query: GetListFaqBoardDto,
  ): Promise<PagingResDto<FaqBoardDto> | Buffer> {
    var filter: FilterQuery<FaqBoardDocument> = {}
    if (query.category != undefined) {
      filter.title = { $regex: query.category };
    }

    const projection: ProjectionFields<FaqBoardDto> = {
      _id: 1,
      category: 1,
      question: 1,
      answer: 1,
      createdAt: 1,
    };

    const cursor = await this.faqboardModel.aggregate([
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

  // FAQ Catergory Services
  async createFaqCategory(body: FaqCategoryDto): Promise<string> {
    var faqcategory: FaqCategory = new FaqCategory();
    faqcategory = {
      category: body.category,
    }
    const result = await new this.faqcategoryModel(faqcategory).save();
    return result._id.toString(); 
  }

  async existFaqCategoryById(faqcategory_id: string): Promise<boolean> {
    const faqcategory = await this.faqcategoryModel.findById(faqcategory_id);
    if (!faqcategory) {
      return false;
    }
    return true;
  }

  async updateFaqCategory(faqcategory_id: string, body: UpdateFaqCategoryDto): Promise<string> {
    const result = await this.faqcategoryModel.findByIdAndUpdate(faqcategory_id, { 
      $set: {
        category: body.category,
        updatedAt: now()}
    });

    return result._id.toString();
  }

  async deleteFaqCategory(faqcategory_id: string): Promise<string> {
    await this.faqcategoryModel.findByIdAndDelete(faqcategory_id);
    return faqcategory_id
  }

  async getPagingFaqCategory(
    query: GetListFaqCategoryDto,
  ): Promise<PagingResDto<FaqCategoryDto> | Buffer> {
    const projection: ProjectionFields<FaqCategoryDto> = {
      _id: 1,
      category: 1,
      createdAt: 1,
    };

    const cursor = await this.faqcategoryModel.aggregate([
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
