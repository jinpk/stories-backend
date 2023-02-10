import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { TimeLine } from '../dto/educontents.dto';

export type EduContentsDocument = HydratedDocument<EduContents>;
export type QuizsDocument = HydratedDocument<Quizs>;

@Schema()
export class EduContents {
  @Prop()
  contentsSerialNum: string;

  @Prop()
  level: string;

  @Prop()
  title: string;

  @Prop()
  vocabCount: number;

  @Prop()
  questionCount: number;

  @Prop()
  imagePath: string;
  
  @Prop()
  audioFilePath: string;

  @Prop()
  timeLine: TimeLine[];
}

@Schema()
export class Quizs {
  @Prop()
  contentsSerialNum: string;

  @Prop()
  quizType: string;

  @Prop()
  question: string;

  @Prop()
  passage: string;

  @Prop()
  answer: string[];

  @Prop()
  options: string[];
}

export const EduContentsSchema = SchemaFactory.createForClass(EduContents);
export const QuizsSchema = SchemaFactory.createForClass(Quizs);