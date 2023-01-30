import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, ProjectionFields, Types } from 'mongoose';
import { PagingResDto } from 'src/common/dto/response.dto';
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
    @InjectModel(Coupon.name) private couponModel: Model<CouponDocument>,
    @InjectModel(UserCoupon.name)
    private userCouponModel: Model<UserCouponDocument>,
  ) {}

  async sentCouponToUsers(body: CreateUserCouponDto) {
    const docs: UserCoupon[] = body.userIds.map((x) => {
      return {
        userId: new Types.ObjectId(x),
        couponId: new Types.ObjectId(body.couponId),
      };
    });

    await this.userCouponModel.insertMany(docs);
  }

  async existCouponById(id: string) {
    const coupon = await this.couponModel.findById(id);
    if (!coupon || coupon.deleted) {
      return false;
    }
    return true;
  }

  async getCouponById(id: string): Promise<CouponDto> {
    const doc = await this.couponModel.findById(id);
    return this._docToCouponDto(doc);
  }

  async deleteCoupon(id: string) {
    await this.couponModel.findByIdAndUpdate(id, { $set: { deleted: true } });
  }

  async updateCoupon(id: string, body: UpdateCouponDto) {
    await this.couponModel.findByIdAndUpdate(id, { $set: body });
  }

  async getPagingCouponSentList(
    query: GetCouponsSentDto,
  ): Promise<PagingResDto<UserCouponDto>> {
    const filter: FilterQuery<UserCouponDocument> = {
      name: { $regex: query.name || '', $options: 'i' },
    };

    if (query.userId) {
      filter.userId = new Types.ObjectId(query.userId);
    }

    const projection: ProjectionFields<UserCouponDto> = {
      _id: 0,
      subscriptionId: 1,
      userId: 1,
      createdAt: 1,
      userCouponId: '$_id',
      nickname: '$users.nickname',
      id: '$coupons._id',
      name: '$coupons.name',
      description: '$coupons.description',
      type: '$coupons.type',
      start: '$coupons.start',
      end: '$coupons.end',
      value: '$coupons.value',
    };

    const cursor = await this.userCouponModel.aggregate([
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
      { $project: projection },
      { $match: filter },
      { $sort: { createdAt: -1 } },
      {
        $facet: {
          metadata: [{ $count: 'total' }],
          data: [
            { $skip: (parseInt(query.page) - 1) * parseInt(query.limit) },
            { $limit: parseInt(query.limit) },
          ],
        },
      },
    ]);

    const metdata = cursor[0].metadata;
    const data = cursor[0].data;

    return {
      total: metdata[0]?.total || 0,
      data: data,
    };
  }

  async getPagingCoupons(
    query: GetCouponsDto,
  ): Promise<PagingResDto<CouponDto>> {
    const filter: FilterQuery<CouponDocument> = {
      name: { $regex: query.name || '', $options: 'i' },
      deleted: false,
    };

    const docs = await this.couponModel
      .find(filter)
      .limit(parseInt(query.limit))
      .skip((parseInt(query.page) - 1) * parseInt(query.limit))
      .sort({ createdAt: -1 });

    const total = await this.couponModel.countDocuments(filter);
    const data: CouponDto[] = docs.map((doc) => this._docToCouponDto(doc));
    return {
      total,
      data,
    };
  }

  async createCounpon(body: CreateCouponDto) {
    const doc = await new this.couponModel({
      name: body.name,
      description: body.description,
      type: body.type,
      value: body.value,
      start: body.start,
      end: body.end,
      deleted: false,
    }).save();
    return doc._id.toString();
  }

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

    return dto;
  }
}
