import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CouponsController } from './coupons.controller';
import { CouponsService } from './coupons.service';
import { Coupon, CouponSchema } from './schemas/coupon.schema';
import { UserCoupon, UserCouponSchema } from './schemas/user-coupon.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Coupon.name, schema: CouponSchema }]),
    MongooseModule.forFeature([
      { name: UserCoupon.name, schema: UserCouponSchema },
    ]),
  ],
  controllers: [CouponsController],
  providers: [CouponsService],
})
export class CouponsModule {}
