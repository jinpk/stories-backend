import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { UserAgree, UserAgreeDocument } from './schemas/user-agree.schema';
import { UserAgreeTypes } from './enums';

@Injectable()
export class UsersAgreeService {
  constructor(
    @InjectModel(UserAgree.name)
    private userAgreeModel: Model<UserAgreeDocument>,
  ) {}

  async agreeByUserId(userId: string, userAgreeId: string, agreed: boolean) {
    await this.userAgreeModel.findOneAndUpdate(
      {
        userId: new mongoose.Types.ObjectId(userId),
        _id: new mongoose.Types.ObjectId(userAgreeId),
      },
      {
        $set: {
          agreed,
        },
      },
    );
  }

  async findAgreesByUserId(userId: string) {
    const list = await this.userAgreeModel.find({
      userId: new mongoose.Types.ObjectId(userId),
    });

    // 약관 동의 데이터 아직 초기화되지 않았다면
    // 회원가입 이벤트에서 처리되나 기존 가입 고객 예외 처리
    if (!list.length) {
      // 약관 초기화 후
      await this.initAgreesByUserId(userId);
      // 재귀 호출
      return await this.findAgreesByUserId(userId);
    }

    return list;
  }

  async initAgreesByUserId(userId: string) {
    await new this.userAgreeModel({
      type: UserAgreeTypes.Adult,
      userId: new mongoose.Types.ObjectId(userId),
      agreed: false,
    }).save();
    await new this.userAgreeModel({
      type: UserAgreeTypes.PersonalInfo,
      userId: new mongoose.Types.ObjectId(userId),
      agreed: false,
    }).save();
    await new this.userAgreeModel({
      type: UserAgreeTypes.TermsCond,
      userId: new mongoose.Types.ObjectId(userId),
      agreed: false,
    }).save();
  }
}
