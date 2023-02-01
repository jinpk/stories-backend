import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type BannerDocument = HydratedDocument<Banner>;

@Schema()
export class Banner {
  @Prop()
  active: boolean;

  @Prop()
  title: string;

  @Prop()
  startDate: string;

  @Prop()
  endDate: string;

  @Prop()
  imageFilePath: string;
}

export const BannerSchema = SchemaFactory.createForClass(Banner);
