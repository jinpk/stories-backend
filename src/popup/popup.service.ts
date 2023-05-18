/*
  팝업 조회,등록,관리 서비스 함수
  - 팝업 조회/등록/관리
*/

import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  now,
  FilterQuery,
  Model,
  ProjectionFields,
} from 'mongoose';
import { PagingResDto } from 'src/common/dto/response.dto';
import { Popup, PopupDocument } from './schemas/popup.schema';
import { PopupDto } from './dto/popup.dto';
import { GetListPopupDto } from './dto/get-popup.dto';
import { UpdatePopupDto } from './dto/update-popup.dto';
import { UtilsService } from 'src/common/providers';

@Injectable()
export class PopupService {
  constructor(
    private utilsService: UtilsService,
    @InjectModel(Popup.name) private popupModel: Model<PopupDocument>,
  ) {}

  /*  
  * 팝업 조회 by Id
  * @params:
  *   popup_id:                string
  * @return:
  *   PopupDocument             object
  */
  async getPopupById(popup_id: string): Promise<PopupDocument | false> {
    const popup =  await this.popupModel.findById(popup_id);
    if (!popup) {
      return false;
    }

    return popup;
  }

  /*  
  * 팝업 생성
  * @params:
  *   body:                PopupDto
  * @return:
  *   id                   string
  */
  async createPopup(body: PopupDto): Promise<string> {
    var popup: Popup = new Popup();
    popup = {
      active: body.active,
      title: body.title,
      startDate: body.startDate,
      endDate: body.endDate,
      imageFilePath: body.imageFilePath,
      size: body.size,
      link: body.link,
    }
    const result = await new this.popupModel(popup).save();
    return result._id.toString(); 
  }

  /*  
  * 팝업 존재 유무 파악
  * @params:
  *   popup_id:            string
  * @return:
  *   true || false         string
  */
  async existPopup(popup_id: string): Promise<boolean> {
    const popup = await this.popupModel.findOne({popup_id});
    if (!popup) {
        return false
    }
      return true
  }

  /*  
  * 팝업 수정
  * @params:
  *   popup_id:            string
  *   body:                UpdatePopupDto
  * @return:
  *   id                   string
  */
  async updatePopup(popup_id: string, body: UpdatePopupDto): Promise<string> {
    const result = await this.popupModel.findByIdAndUpdate(popup_id, { 
      $set: {
        active: body.active,
        title: body.title,
        startDate: body.startDate,
        endDate: body.endDate,
        imageFilePath: body.imageFilePath,
        size: body.size,
        link: body.link,
        updatedAt: now()}
    });

    return result._id.toString();
  }

  /*  
  * 팝업 삭제
  * @params:
  *   popup_id:            string
  * @return:
  *   id                   string
  */
  async deletePopup(popup_id: string): Promise<string> {
    const result = await this.popupModel.findByIdAndDelete(popup_id);
    return result._id.toString();
  }

  /*
  * 팝업 리스트 조회
  * @params:
  *   query:                GetListPopupDto
  * @return: {
  *   total:               number
  *   data: [
  *     {PopupDocument},
  *   ]
  * }
  */
  async getPagingPopups(
    query: GetListPopupDto,
  ): Promise<PagingResDto<PopupDto> | Buffer> {
    var filter: FilterQuery<PopupDocument> = {}
    if (query.title != undefined) {
      filter.title = { $regex: query.title };
    }

    const projection: ProjectionFields<PopupDto> = {
      _id: 1,
      active: 1,
      title: 1,
      startDate: 1,
      endDate: 1,
      imageFilePath: 1,
      size: 1,
      link: 1,
      createdAt: 1,
    };

    const cursor = await this.popupModel.aggregate([
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
