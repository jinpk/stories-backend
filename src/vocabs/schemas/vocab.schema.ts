import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { now, HydratedDocument } from 'mongoose';
import { PreviewVocabulary } from '../dto/vocab.dto';

export type VocabDocument = HydratedDocument<Vocab>;

@Schema({ timestamps: true })
export class Vocab {
  @Prop()
  contentsSerialNum: string;

  @Prop()
  audioFilePath: string;

  @Prop()
  vocab: string;

  @Prop()
  meaningEn: string;

  @Prop()
  value: string;

  @Prop()
  connSentence: string;

  @Prop()
  previewVocabulary: PreviewVocabulary;

  @Prop({})
  createdAt?: Date;
}

export const VocabSchema = SchemaFactory.createForClass(Vocab);
