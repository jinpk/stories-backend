import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AppOS } from 'src/common/enums';
import { VerifySubscriptionDto } from './dto/verify-subscription.dto';
import { SubscriptionStates } from './enums';
import { IAPValidatorProvider } from './providers/iap-validator.provider';
import { GoogleVerifierService } from './providers/google-verifier.service';
import { IAP_PURCHASE_ITEM_PERIOD_MAP } from './subscriptions.constant';

import {
  Subscription,
  SubscriptionDocument,
  SubscriptionHistory,
} from './schemas/subscription.schema';

@Injectable()
export class SubscriptionsService {
  constructor(
    @InjectModel(Subscription.name)
    private subscriptionModel: Model<SubscriptionDocument>,
    private iapValidatorProvider: IAPValidatorProvider,
  ) {}

  async verify(dto: VerifySubscriptionDto) {
    console.log('subscription verify', JSON.stringify(dto));
    const product = IAP_PURCHASE_ITEM_PERIOD_MAP[dto.productId];
    if (!product) {
      throw new Error('유효하지 않은 productId 입니다.');
    }
    // TODO: 구독이 갱신 결제인지 첫 구독 결제인지 고유 값이 어떤건지 확인하고
    // 해당 고유값으로 확인 필요

    const existSubscription = await this.subscriptionModel.findOne({
      userId: dto.userId,
      productId: dto.productId,
    });

    const history = new SubscriptionHistory();

    /** 앱스토어, 플레이스토어 인앱결제 정보 조회 FLOW */
    // 1. API 요청으로 데이터 확인
    // 앱스토어, 플레이스토어 인앱결제 검증 return data
    let orderId: string;
    try {
      if (dto.os === AppOS.Android) {
        const { purchaseToken } = JSON.parse(dto.purchaseToken);
        const playstoreRes =
          await this.iapValidatorProvider.validateGooglePurchase(
            dto.productId,
            purchaseToken,
          );
        orderId = playstoreRes.orderId;

        // if (existSubscription) {
        //   // 해당 구독 결제가 2회 이상 진행 즉 구독 갱신인 경우 push
        //   existSubscription.histories.push(history);
        //   // TODO: 여기서 히스토리 정보를 보고 만약 구독이 취소, 다운그레이드, 업그레인드인경우 상태 변경 필요
        //   // 취소인 경우
        //   if (playstoreRes.purchaseType) {
        //     if (existSubscription.state == 'active') {
        //       existSubscription.state = SubscriptionStates.Expired;
        //     }
        //   // 다운드레이드인 & 업드레이드인 경우
        //   } else {
    
        //   }
        //   await existSubscription.save();
        // } else {
        //   // 첫 구독 결제하는거면 새로 생성
        //   await new this.subscriptionModel({
        //     ...dto,
        //     state: SubscriptionStates.Active,
        //     histories: [history],
        //   }).save();
        // }

      } else if (dto.os === AppOS.Ios) {
        const appstoreRes = await this.iapValidatorProvider.validateIOSPurchase(
          dto.receiptData,
        );
        orderId = appstoreRes.receipt.in_app[0].transaction_id;

        // if (existSubscription) {
        //   // 해당 구독 결제가 2회 이상 진행 즉 구독 갱신인 경우 push
        //   existSubscription.histories.push(history);
        //   // TODO: 여기서 히스토리 정보를 보고 만약 구독이 취소, 다운그레이드, 업그레인드인경우 상태 변경 필요
        //   // 취소인 경우
        //   if (existSubscription.state == 'active') {
        //     if (existSubscription.state == 'active') {
        //       existSubscription.state = SubscriptionStates.Expired;
        //     }
        //   // 다운드레이드인 & 업드레이드인 경우
        //   } else {
    
        //   }
        //   await existSubscription.save();
        // } else {
        //   // 첫 구독 결제하는거면 새로 생성
        //   await new this.subscriptionModel({
        //     ...dto,
        //     state: SubscriptionStates.Active,
        //     histories: [history],
        //   }).save();
        // }
      }
      console.log(`IAP Purchased: ${dto.os} - ${orderId}`);
      // 각 스토어 response data를 history로 데이터 가공 필요
    } catch (error: any) {
      console.error(`IAP Purchase Validation error: ${JSON.stringify(error)}`);
      throw error;
    }
  }
}
