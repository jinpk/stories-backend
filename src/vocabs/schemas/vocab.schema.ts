import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type VocabDocument = HydratedDocument<Vocab>;

@Schema()
export class Vocab {
  @Prop()
  contentsSerialNum: string;

  @Prop()
  vocab: string;

  @Prop()
  meaning_en: string;

  @Prop()
  value: string;

  @Prop()
  cont_sentence: string;

  @Prop()
  authFilePath: string;
}

export const VocabSchema = SchemaFactory.createForClass(Vocab);
