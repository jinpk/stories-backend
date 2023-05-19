/*
  FAQ 조회,등록,관리 서비스 함수
  -FAQ 게시판 관리
  -FAQ 카테고리 관리
*/

import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  now,
  FilterQuery,
  Model,
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
  
  /*
  * Faq 조회 by Id
  * @params:
  *   faqboard_id:           string
  * @return:
  *   faqboard               FaqBoardDocument
  */
  async GetFaqById(faqboard_id: string): Promise<FaqBoardDocument | false> {
    const faqboard = await this.faqboardModel.findById(faqboard_id);
    if (!faqboard) {
      return false;
    }

    return faqboard;
  }

  /*
  * Faq 생성
  * @params:
  *   body:                  FaqBoardDto
  * @return:
  *   id                     string
  */
  async createFaq(body: FaqBoardDto): Promise<string> {
    var faqboard: FaqBoard = new FaqBoard();
    faqboard = {
      categoryId: new Types.ObjectId(body.categoryId),
      question: body.question,
      answer: body.answer
    }
    const result = await new this.faqboardModel(faqboard).save();
    return result._id.toString(); 
  }

  /*
  * Faq 수정
  * @params:
  *   faqboard_id:           string
  * @return:
  *   true || false          boolean
  */
  async existFaqById(faqboard_id: string): Promise<boolean> {
    const faqboard = await this.faqboardModel.findById(faqboard_id);
    if (!faqboard) {
      return false;
    }
    return true;
  }

  /*
  * Faq 수정
  * @params:
  *   faqboard_id:           string
  *   body:                  UpdateFaqBoardDto
  * @return:
  *   id                     string
  */
  async updateFaq(faqboard_id: string, body: UpdateFaqBoardDto): Promise<string> {
    const result = await this.faqboardModel.findByIdAndUpdate(faqboard_id, { 
      $set: {
        categoryId: body.categoryId,
        question: body.question,
        answer: body.answer,
        updatedAt: now()}
    });

    return result._id.toString();
  }

  /*
  * Faq 삭제
  * @params:
  *   faqboard_id:           string
  * @return:
  *   id                     string
  */
  async deleteFaq(faqboard_id: string): Promise<string> {
    await this.faqboardModel.findByIdAndDelete(faqboard_id);
    return faqboard_id
  }

  /*
  * Faq 목록 조회
  * @query:
  *   query:                 GetListFaqBoardDto
  * @return: {
  *   total:                 number
  *   data: [
  *   FaqCategory,           FaqBoardDto[]
  *   ]
  * }
  */
  async getPagingFaqs(
    query: GetListFaqBoardDto,
  ): Promise<PagingResDto<FaqBoardDto> | Buffer> {
    var filter: FilterQuery<FaqBoardDocument> = {}
    if (query.categoryId != undefined) {
      filter.categoryId = { $eq: query.categoryId };
    }

    const projection: ProjectionFields<FaqBoardDto> = {
      _id: 1,
      categoryId: 1,
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
  /*
  * Faq 카테고리 생성
  * @params:
  *   body:                  FaqCategoryDto
  * @return:
  *   id                     string
  */
  async createFaqCategory(body: FaqCategoryDto): Promise<string> {
    var faqcategory: FaqCategory = new FaqCategory();
    faqcategory = {
      category: body.category,
    }
    const result = await new this.faqcategoryModel(faqcategory).save();
    return result._id.toString(); 
  }

  /*
  * Faq 카테고리 조회 by Id
  * @params:
  *   faqcategory_id:        string
  * @return:
  *   true || false          boolean
  */
  async existFaqCategoryById(faqcategory_id: string): Promise<boolean> {
    const faqcategory = await this.faqcategoryModel.findById(faqcategory_id);
    if (!faqcategory) {
      return false;
    }
    return true;
  }

  /*
  * Faq 카테고리 수정
  * @params:
  *   faqcategory_id:        string
  *   body:                  UpdateFaqCategoryDto
  * @return:
  *   id                     string
  */
  async updateFaqCategory(faqcategory_id: string, body: UpdateFaqCategoryDto): Promise<string> {
    const result = await this.faqcategoryModel.findByIdAndUpdate(faqcategory_id, { 
      $set: {
        category: body.category,
        updatedAt: now()}
    });

    return result._id.toString();
  }

  /*
  * Faq 카테고리 삭제
  * @params:
  *   faqcategory_id:        string
  * @return:
  *   id                     string
  */
  async deleteFaqCategory(faqcategory_id: string): Promise<string> {
    await this.faqcategoryModel.findByIdAndDelete(faqcategory_id);
    return faqcategory_id
  }

  /*
  * Faq 카테고리 목록 조회
  * @query:
  *   query:             GetListFaqCategoryDto
  * @return: {
  *   total:                 number
  *   data: [
  *   FaqCategory,           FaqCategoryDto[]
  *   ]
  * }
  */
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
