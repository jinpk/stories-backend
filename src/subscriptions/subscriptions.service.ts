import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AppOS } from 'src/common/enums';
import { VerifySubscriptionDto } from './dto/verify-subscription.dto';
import { SubscriptionStates } from './enums';
import { GoogleVerifierService } from './providers/google-verifier.service';
import {
  Subscription,
  SubscriptionDocument,
} from './schemas/subscription.schema';

@Injectable()
export class SubscriptionsService {
  constructor(
    private googleVerifierService: GoogleVerifierService,
    @InjectModel(Subscription.name)
    private subscriptionModel: Model<SubscriptionDocument>,
  ) {}

  async verify(dto: VerifySubscriptionDto) {
    // 구독이 갱신 결제인지 첫 구독 결제인지 고유 값이 transactionId가 맞는지는 확인 필요.
    const existSubscription = await this.subscriptionModel.findOne({
      transactionId: dto.transactionId,
    });

    // 앱스토어, 플레이스토어 인앱결제 검증 return data
    let verifiedResult: any;
    /*if (dto.os === AppOS.Android) {
      verifiedResult = await this.googleVerifierService.verifySubscription(
        dto.token,
      );
    } else if (dto.os === AppOS.Ios) {
    }*/

    verifiedResult = {};

    // 스트링으로 변환후 디비에 저장
    verifiedResult = JSON.stringify(verifiedResult);

    if (existSubscription) {
      // 해당 구독 결제가 2회 > 갱신 결제인 경우 push
      existSubscription.verifiedResults.push({ data: verifiedResult });
      await existSubscription.save();
    } else {
      // 첫 구독 결제하는거면 새로 생성
      await new this.subscriptionModel({
        userId: dto.userId,
        transactionId: dto.transactionId,
        productId: dto.productId,
        userCouponId: dto.userCouponId,
        os: dto.os,
        state: SubscriptionStates.Active,
        verifiedResults: [{ data: verifiedResult }],
      }).save();
    }
  }
}
