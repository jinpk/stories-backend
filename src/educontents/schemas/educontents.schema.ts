import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { ContentsType, SeperateSentence } from '../dto/educontents.dto';

export type EduContentsDocument = HydratedDocument<EduContents>;

@Schema()
export class EduContents {
  @Prop()
  contentsSerialNum: string;

  @Prop()
  level: string;

  @Prop()
  contentsType: ContentsType;

  @Prop()
  seriesSequence: string;

  @Prop()
  storySequence: string;

  @Prop()
  title: string;

  @Prop()
  vocabCount: number;

  @Prop()
  questionCount: number;

  @Prop()
  coverFilePath: string;
  
  @Prop()
  audioFilePath: string;

  @Prop()
  seperateSentence: SeperateSentence[];
}

export const EduContentsSchema = SchemaFactory.createForClass(EduContents);
