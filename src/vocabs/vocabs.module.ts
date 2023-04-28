import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Vocab, VocabSchema } from './schemas/vocab.schema';
import { ReviewVocab, ReviewVocabSchema } from './schemas/review-vocab.schema';
import { VocabsController } from './vocabs.controller';
import { VocabsService } from './vocabs.service';
import { StaticModule } from 'src/static/static.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Vocab.name, schema: VocabSchema }]),
    MongooseModule.forFeature([{ name: ReviewVocab.name, schema: ReviewVocabSchema }]),
    StaticModule,
  ],
  controllers: [VocabsController],
  providers: [VocabsService],
  exports: [VocabsService],
})
export class VocabsModule {}
