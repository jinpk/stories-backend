import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { ContentsType, CoreType } from '../dto/vocab.dto';

export type VocabDocument = HydratedDocument<Vocab>;

@Schema()
export class Vocab {
  @Prop()
  contentsSerialNum: string;

  @Prop()
  level: string;

  @Prop()
  contents_type: ContentsType;

  @Prop()
  story: string;

  @Prop()
  vocab: string;

  @Prop()
  audio_file_path: string;

  @Prop()
  sentence: string;

  @Prop()
  value: string;

  @Prop()
  meaning_en: string;

  @Prop()
  core_type: CoreType;
}

export const VocabSchema = SchemaFactory.createForClass(Vocab);
