import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { now, HydratedDocument } from 'mongoose';

export type BannerDocument = HydratedDocument<Banner>;

@Schema({ timestamps: true })
export class Banner {
  @Prop()
  active: boolean;

  @Prop()
  title: string;

  @Prop()
  startDate: Date;

  @Prop()
  endDate: Date;

  @Prop()
  imageFilePath: string;

  @Prop()
  link: string;

  @Prop({default: now()})
  createdAt?: Date;
}

export const BannerSchema = SchemaFactory.createForClass(Banner);
