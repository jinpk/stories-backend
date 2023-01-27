import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type CouponDocument = HydratedDocument<Coupon>;

@Schema({ timestamps: true })
export class Coupon {
  @Prop()
  name: string;

  @Prop()
  description: string;

  @Prop({ enum: ['percent', 'amount', 'period'] })
  type: string;

  @Prop()
  start: Date;

  @Prop({})
  end: Date;

  @Prop({ default: false })
  deleted: boolean;

  @Prop({ default: null })
  deletedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export const CouponSchema = SchemaFactory.createForClass(Coupon);
