/*
  쿠폰 조회,등록,관리 서비스 함수
  -쿠폰 발송/조회/수정 관리
*/

import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  FilterQuery,
  Model,
  PipelineStage,
  ProjectionFields,
  Types,
} from 'mongoose';
import { PagingResDto } from 'src/common/dto/response.dto';
import { CommonExcelService, UtilsService } from 'src/common/providers';
import { EXCEL_COLUMN_LIST, EXCEL_COLUMN_LIST_SENT } from './coupons.constant';
import { CouponDto } from './dto/coupon.dto';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { GetCouponsDto, GetCouponsSentDto } from './dto/get-coupon.dto';
import { UpdateCouponDto } from './dto/update-coupon.dto';
import { CreateUserCouponDto, UserCouponDto } from './dto/user-coupon.dto';
import { Coupon, CouponDocument } from './schemas/coupon.schema';
import { UserCoupon, UserCouponDocument } from './schemas/user-coupon.schema';

@Injectable()
export class CouponsService {
  constructor(
    private utilsService: UtilsService,
    private commonExcelService: CommonExcelService,
    @InjectModel(Coupon.name) private couponModel: Model<CouponDocument>,
    @InjectModel(UserCoupon.name)
    private userCouponModel: Model<UserCouponDocument>,
  ) {}

  /*
  * 유저에게 쿠폰 발송
  * @params:
  *   body:                   CreateUserCouponDto
  * @return: 
  */
  async sentCouponToUsers(body: CreateUserCouponDto) {
    const docs: UserCoupon[] = body.userIds.map((x) => {
      return {
        userId: new Types.ObjectId(x),
        couponId: new Types.ObjectId(body.couponId),
      };
    });

    await this.userCouponModel.insertMany(docs);
  }

  /*
  * 쿠폰 조회 by Id
  * @params:
  *   id:                   string
  * @return: 
  *   true || false         boolean
  */
  async existCouponById(id: string) {
    const coupon = await this.couponModel.findById(id);
    if (!coupon || coupon.deleted) {
      return false;
    }
    return true;
  }

  /*
  * 쿠폰 조희 by Id
  * @params:
  *   id:                   string
  * @return: 
  *                         CouponDto
  */
  async getCouponById(id: string): Promise<CouponDto> {
    const doc = await this.couponModel.findById(id);
    return this._docToCouponDto(doc);
  }

  /*
  * 쿠폰 삭제
  * @params:
  *   id:                   string
  * @return: 
  */
  async deleteCoupon(id: string) {
    await this.couponModel.findByIdAndUpdate(id, { $set: { deleted: true } });
  }

  /*
  * 쿠폰 수정
  * @params:
  *   id:                   string
  *   body:                 UpdateCouponDto
  * @return: 
  */
  async updateCoupon(id: string, body: UpdateCouponDto) {
    await this.couponModel.findByIdAndUpdate(id, { $set: body });
  }

  /*
  * 쿠폰 발송 내역 조회
  * @query:
  *   query:               GetCouponsSentDto
  * @return: {
  *   total: number,
  *   data: [
  *     {
  *       UserCouponDto
  *     },
  *   ]
  * }
  */
  async getPagingCouponSentList(
    query: GetCouponsSentDto,
  ): Promise<PagingResDto<UserCouponDto> | Buffer> {
    const filter: FilterQuery<UserCouponDto> = {
      name: { $regex: query.name || '', $options: 'i' },
      used: { $eq: query.used === '1' },
    };

    if (query.userId) {
      filter.userId = new Types.ObjectId(query.userId);
    }

    const lookups: PipelineStage[] = [
      {
        $lookup: {
          from: 'coupons',
          localField: 'couponId',
          foreignField: '_id',
          as: 'coupons',
        },
      },
      {
        $unwind: {
          path: '$coupons',
          preserveNullAndEmptyArrays: false,
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'users',
        },
      },
      {
        $unwind: {
          path: '$users',
          preserveNullAndEmptyArrays: false,
        },
      },
      {
        $lookup: {
          from: 'subscriptions',
          foreignField: 'userCouponId',
          localField: '_id',
          as: 'subscriptions',
        },
      },
    ];

    const projection: ProjectionFields<UserCouponDto> = {
      _id: 0,
      id: '$coupons._id',
      userCouponId: '$_id',
      nickname: '$users.nickname',
      name: '$coupons.name',
      description: '$coupons.description',
      type: '$coupons.type',
      start: '$coupons.start',
      end: '$coupons.end',
      storeId: '$coupons.storeId',
      value: '$coupons.value',
      userId: 1,
      createdAt: 1,
      used: {
        $cond: [{ $gte: [{ $size: '$subscriptions' }, 1] }, true, false],
      },
    };

    const cursor = await this.userCouponModel.aggregate([
      ...lookups,
      { $project: projection },
      { $match: filter },
      { $sort: { createdAt: -1 } },
      this.utilsService.getCommonMongooseFacet(query),
    ]);

    const metdata = cursor[0].metadata;
    const data = cursor[0].data;

    if (query.excel === '1') {
      return await this.commonExcelService.listToExcelBuffer(
        EXCEL_COLUMN_LIST_SENT,
        data,
      );
    }

    return {
      total: metdata[0]?.total || 0,
      data: data,
    };
  }

  /*
  * 쿠폰 목록 조회
  * @query:
  *   query:               GetCouponsDto
  * @return: {
  *   total: number,
  *   data: [
  *     {
  *       CouponDocument
  *     },
  *   ]
  * }
  */
  async getPagingCoupons(
    query: GetCouponsDto,
  ): Promise<PagingResDto<CouponDto> | Buffer> {
    const filter: FilterQuery<CouponDocument> = {
      name: { $regex: query.name || '', $options: 'i' },
      deleted: false,
    };

    const lookups: PipelineStage[] = [
      {
        $lookup: {
          from: 'subscriptions',
          let: { couponId: '$_id' },
          pipeline: [
            {
              $lookup: {
                from: 'usercoupons',
                let: { couponId: '$$couponId', userCouponId: '$userCouponId' },
                pipeline: [
                  {
                    $match: {
                      couponId: { $eq: '$$couponId' },
                      _id: { $eq: '$$userCouponId' },
                    },
                  },
                ],
                as: 'usedcoupons',
              },
            },
            {
              $match: {
                $expr: {
                  $gte: [{ $size: '$usedcoupons' }, 1],
                },
              },
            },
          ],
          as: 'subscriptions',
        },
      },
    ];

    const projection: ProjectionFields<CouponDto> = {
      name: 1,
      description: 1,
      type: 1,
      value: 1,
      start: 1,
      end: 1,
      storeId: 1,
      usedCount: { $size: '$subscriptions' },
    };

    const cursor = await this.couponModel.aggregate([
      { $match: filter },
      ...lookups,
      { $project: projection },
      { $sort: { createdAt: -1 } },
      this.utilsService.getCommonMongooseFacet(query),
    ]);

    const metdata = cursor[0].metadata;
    const data = cursor[0].data;

    if (query.excel === '1') {
      return await this.commonExcelService.listToExcelBuffer(
        EXCEL_COLUMN_LIST,
        data,
      );
    }

    return {
      total: metdata[0]?.total || 0,
      data: data,
    };
  }

  /*
  * 쿠폰 생성
  * @params:
  *   body:                CreateCouponDto
  * @return:
  *   id:                 string
  */
  async createCounpon(body: CreateCouponDto) {
    const doc = await new this.couponModel({
      name: body.name,
      description: body.description,
      type: body.type,
      value: body.value,
      start: body.start,
      end: body.end,
      storeId: body.storeId,
      deleted: false,
    }).save();
    return doc._id.toString();
  }

  /*
  * Schema to dto 변환
  * @params:
  *   doc:                CouponDocument
  * @return:
  *   dto:            CouponDto
  */
  _docToCouponDto(doc: CouponDocument): CouponDto {
    const dto = new CouponDto();
    dto.id = doc._id.toString();
    dto.name = doc.name;
    dto.description = doc.description;
    dto.type = doc.type;
    dto.value = doc.value;
    dto.start = doc.start;
    dto.end = doc.end;
    dto.createdAt = doc.createdAt;
    dto.storeId = doc.storeId;

    return dto;
  }
}
