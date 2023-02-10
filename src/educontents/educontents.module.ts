import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { EduContents, EduContentsSchema, Quizs, QuizsSchema } from './schemas/educontents.schema';
import { Vocab, VocabSchema } from '../vocabs/schemas/vocab.schema';
import { EducontentsController } from './educontents.controller';
import { EducontentsService } from './educontents.service';
import { AwsService } from 'src/aws/aws.service';

@Module({
    imports: [
      MongooseModule.forFeature([{ name: EduContents.name, schema: EduContentsSchema }]),
      MongooseModule.forFeature([{ name: Vocab.name, schema: VocabSchema }]),
      MongooseModule.forFeature([{ name: Quizs.name, schema: QuizsSchema }]),
    ],
    controllers: [EducontentsController],
    providers: [EducontentsService, AwsService],
    exports: [EducontentsService],
  })
  export class EducontentsModule {}