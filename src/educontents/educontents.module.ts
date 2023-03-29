import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  EduContents,
  EduContentsSchema,
  Quizs,
  QuizsSchema,
} from './schemas/educontents.schema';
import { Vocab, VocabSchema } from '../vocabs/schemas/vocab.schema';
import { Bookmark, BookmarkSchema } from './schemas/bookmark.schema';
import { EducontentsController } from './educontents.controller';
import { EducontentsService } from './educontents.service';
import { AwsService } from 'src/aws/aws.service';
import { Bulk, BulkLog, BulkLogSchema, BulkSchema } from './schemas/bulk.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: EduContents.name, schema: EduContentsSchema },
    ]),
    MongooseModule.forFeature([{ name: Vocab.name, schema: VocabSchema }]),
    MongooseModule.forFeature([{ name: Quizs.name, schema: QuizsSchema }]),
    MongooseModule.forFeature([
      { name: Bookmark.name, schema: BookmarkSchema },
    ]),
    MongooseModule.forFeature([{ name: Bulk.name, schema: BulkSchema }]),
    MongooseModule.forFeature([{ name: BulkLog.name, schema: BulkLogSchema }]),
  ],
  controllers: [EducontentsController],
  providers: [EducontentsService, AwsService],
  exports: [EducontentsService],
})
export class EducontentsModule {}
