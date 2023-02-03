import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type LibraryDocument = HydratedDocument<Library>;

@Schema()
export class Library {
  @Prop()
  contentsSerialNum: string;

  @Prop()
  level: string;

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
}

export const LibrarySchema = SchemaFactory.createForClass(Library);
