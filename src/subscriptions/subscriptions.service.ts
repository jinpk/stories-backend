import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AppOS } from 'src/common/enums';
import { VerifySubscriptionDto } from './dto/verify-subscription.dto';
import { SubscriptionStates } from './enums';
import { IAPValidatorProvider } from './providers/iap-validator.provider';
import { GoogleVerifierService } from './providers/google-verifier.service';
import {
  Subscription,
  SubscriptionDocument,
} from './schemas/subscription.schema';

@Injectable()
export class SubscriptionsService {
  constructor(
    @InjectModel(Subscription.name)
    private subscriptionModel: Model<SubscriptionDocument>,
    private iapValidatorProvider: IAPValidatorProvider,
  ) {}

  async verify(userId: string, body: VerifySubscriptionDto) {
    // 구독이 갱신 결제인지 첫 구독 결제인지 고유 값이 transactionId가 맞는지는 확인 필요.
    const existSubscription = await this.subscriptionModel.findOne({
      transactionId: body.transactionId,
    });

    // 앱스토어, 플레이스토어 인앱결제 검증 return data
    let orderId: string;
    try {
      if (body.os === 'ios') {
        const appstoreRes = await this.iapValidatorProvider.validateIOSPurchase(
          body.receipt,
        );
        orderId = appstoreRes.receipt.in_app[0].transaction_id;
      } else {
        const { purchaseToken } = JSON.parse(body.receipt);
        const playstoreRes =
          await this.iapValidatorProvider.validateGooglePurchase(
            body.productId,
            purchaseToken,
          );
        orderId = playstoreRes.orderId;
      }
      console.log(`IAP Purchased: ${body.os} - ${orderId}`);
    } catch (error: any) {
      console.error(`IAP Purchase Validation error: ${JSON.stringify(error)}`);
      // if (this.configService.get('env') === 'production') {
      //   throw error;
      // }
    }

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
