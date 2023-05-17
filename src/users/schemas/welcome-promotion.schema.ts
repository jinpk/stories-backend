import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { HydratedDocument, Types } from 'mongoose';

export type WelcomePromotionDocument = HydratedDocument<WelcomePromotion>;

@Schema({ timestamps: true })
export class WelcomePromotion {
  @Prop()
  @ApiProperty({ description: '유저 Id' })
  userId: Types.ObjectId;

  @Prop({ default: null })
  @ApiProperty({ description: '가입일/3일 체험 시작일' })
  createdAt?: Date;

  @Prop({ default: null })
  updatedAt?: Date;
}

export const WelcomePromotionSchema = SchemaFactory.createForClass(WelcomePromotion);
