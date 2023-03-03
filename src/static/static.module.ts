import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { EduStatus, EduStatusSchema } from '../edustatus/schemas/edustatus.schema';
import { ReviewVocab, ReviewVocabSchema } from '../vocabs/schemas/review-vocab.schema';
import { StaticController } from './static.controller';
import { StaticService } from './static.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: EduStatus.name, schema: EduStatusSchema }]),
    MongooseModule.forFeature([{ name: ReviewVocab.name, schema: ReviewVocabSchema }]),
  ],
  controllers: [StaticController],
  providers: [StaticService],
  exports: [StaticService],
})
export class StaticModule {}
