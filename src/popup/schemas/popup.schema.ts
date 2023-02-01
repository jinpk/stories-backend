import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { PopupSize, PopupLink } from '../dto/popup.dto';

export type PopupDocument = HydratedDocument<Popup>;

@Schema()
export class Popup {
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

  @Prop()
  size: PopupSize;

  @Prop()
  link: PopupLink;
}

export const PopupSchema = SchemaFactory.createForClass(Popup);
