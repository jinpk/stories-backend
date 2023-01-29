import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type UserCouponDocument = HydratedDocument<UserCoupon>;

@Schema({ timestamps: true })
export class UserCoupon {
  @Prop()
  userId: Types.ObjectId;

  @Prop({})
  counponId: Types.ObjectId;
}

export const UserCouponSchema = SchemaFactory.createForClass(UserCoupon);
