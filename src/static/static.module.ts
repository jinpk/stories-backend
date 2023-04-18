import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { EduStatus, EduStatusSchema } from '../edustatus/schemas/edustatus.schema';
import { ReviewVocab, ReviewVocabSchema } from '../vocabs/schemas/review-vocab.schema';
import { UserStatic, UserStaticSchema } from './schemas/userstatic.schema';
import { ReadStory, ReadStorySchema } from '../edustatus/schemas/readstory.schema';
import {
  EduContents,
  EduContentsSchema
} from 'src/educontents/schemas/educontents.schema';
import { StaticController } from './static.controller';
import { StaticService } from './static.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: EduContents.name, schema: EduContentsSchema }]),
    MongooseModule.forFeature([{ name: EduStatus.name, schema: EduStatusSchema }]),
    MongooseModule.forFeature([{ name: ReviewVocab.name, schema: ReviewVocabSchema }]),
    MongooseModule.forFeature([{ name: UserStatic.name, schema: UserStaticSchema }]),
    MongooseModule.forFeature([{ name: ReadStory.name, schema: ReadStorySchema }]),
  ],
  controllers: [StaticController],
  providers: [StaticService],
  exports: [StaticService],
})
export class StaticModule {}
