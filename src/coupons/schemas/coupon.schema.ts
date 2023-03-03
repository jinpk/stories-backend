import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsNotEmpty, IsPositive } from 'class-validator';
import { HydratedDocument } from 'mongoose';
import { CouponTypes } from '../enums';

export type CouponDocument = HydratedDocument<Coupon>;

@Schema({ timestamps: true })
export class Coupon {
  @Prop()
  @ApiProperty({ description: '쿠폰명' })
  @IsNotEmpty()
  name: string;

  @Prop()
  @ApiProperty({ description: '쿠폰설명' })
  @IsNotEmpty()
  description: string;

  @Prop({ enum: CouponTypes })
  @ApiProperty({ description: '쿠폰유형', enum: CouponTypes })
  @IsEnum(CouponTypes)
  @IsNotEmpty()
  type: string;

  @Prop({ default: 0 })
  @ApiProperty({ description: '쿠폰유형 value' })
  @IsPositive()
  value: number;

  @Prop({})
  @ApiProperty({ description: '쿠폰시작일 (YYYY-MM-DD)' })
  @IsDateString()
  @IsNotEmpty()
  start: Date;

  @Prop({})
  @ApiProperty({ description: '쿠폰만료일 (YYYY-MM-DD)' })
  @IsDateString()
  @IsNotEmpty()
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
