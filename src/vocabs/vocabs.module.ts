import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Vocab, VocabSchema } from './schemas/vocab.schema';
import { VocabsController } from './vocabs.controller';
import { VocabsService } from './vocabs.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Vocab.name, schema: VocabSchema }]),
  ],
  controllers: [VocabsController],
  providers: [VocabsService],
  exports: [VocabsService],
})
export class VocabsModule {}
