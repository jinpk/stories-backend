import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { now, HydratedDocument } from 'mongoose';
import { TimeLine } from '../dto/educontents.dto';

export type EduContentsDocument = HydratedDocument<EduContents>;
export type QuizsDocument = HydratedDocument<Quizs>;

@Schema({ timestamps: true })
export class EduContents {
  @Prop()
  contentsSerialNum: string;

  @Prop()
  level: string;

  @Prop()
  title: string;

  @Prop()
  content: string;

  @Prop()
  seriesNum: number;

  @Prop()
  storyIndex: number;

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

  @Prop({default: now()})
  createdAt?: Date;
}

@Schema({ timestamps: true })
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

  @Prop({default: now()})
  createdAt?: Date;
}

export const EduContentsSchema = SchemaFactory.createForClass(EduContents);
export const QuizsSchema = SchemaFactory.createForClass(Quizs);