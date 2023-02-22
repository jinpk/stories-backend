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
    const existSubscription = await this.subscriptionModel.findOne({
      transactionId: dto.transactionId,
    });

    let verifiedResult: any;
    if (dto.os === AppOS.Android) {
      verifiedResult = await this.googleVerifierService.verifySubscription(
        dto.token,
      );
    } else if (dto.os === AppOS.Ios) {
    }

    verifiedResult = JSON.stringify(verifiedResult);

    if (existSubscription) {
      existSubscription.verifiedResults.push({ data: verifiedResult });
      await existSubscription.save();
    } else {
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
