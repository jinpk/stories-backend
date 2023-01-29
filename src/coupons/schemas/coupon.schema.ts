import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { CouponTypes } from '../enums';

export type CouponDocument = HydratedDocument<Coupon>;

@Schema({ timestamps: true })
export class Coupon {
  @Prop()
  name: string;

  @Prop()
  description: string;

  @Prop({ enum: CouponTypes })
  type: string;

  @Prop({ default: 0 })
  value: number;

  @Prop()
  start: Date;

  @Prop({})
  end: Date;

  @Prop({ default: false })
  deleted: boolean;
  @Prop({ default: null })
  deletedAt?: Date;
  @Prop({ default: null })
  createdAt?: Date;
  @Prop({ default: null })
  updatedAt?: Date;
}

export const CouponSchema = SchemaFactory.createForClass(Coupon);
