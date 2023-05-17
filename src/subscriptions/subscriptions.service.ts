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
  SubscriptionHistory,
} from './schemas/subscription.schema';

@Injectable()
export class SubscriptionsService {
  constructor(
    private googleVerifierService: GoogleVerifierService,
    @InjectModel(Subscription.name)
    private subscriptionModel: Model<SubscriptionDocument>,
  ) {}

  async verify(dto: VerifySubscriptionDto) {
    console.log('subscription verify', JSON.stringify(dto));
    // TODO: 구독이 갱신 결제인지 첫 구독 결제인지 고유 값이 어떤건지 확인하고
    // 해당 고유값으로 확인 필요

    const existSubscription = await this.subscriptionModel.findOne({
      // transactionId: dto.transactionId,
    });

    const history = new SubscriptionHistory();

    /** 앱스토어, 플레이스토어 인앱결제 정보 조회 FLOW */
    // 1. API 요청으로 데이터 확인
    // 앱스토어, 플레이스토어 인앱결제 검증 return data
    try {
      if (dto.os === AppOS.Android) {
      } else if (dto.os === AppOS.Ios) {
      }
      // 각 스토어 response data를 history로 데이터 가공 필요
    } catch (error: any) {
      console.error('iap validation error:', JSON.stringify(error));
    }

    if (existSubscription) {
      // 해당 구독 결제가 2회 이상 진행 즉 구독 갱신인 경우 push
      existSubscription.histories.push(history);
      // TODO: 여기서 히스토리 정보를 보고 만약 구독이 취소, 다운그레이드, 업그레인드인경우 상태 변경 필요
      await existSubscription.save();
    } else {
      // 첫 구독 결제하는거면 새로 생성
      await new this.subscriptionModel({
        ...dto,
        state: SubscriptionStates.Active,
        histories: [history],
      }).save();
    }
  }
}
