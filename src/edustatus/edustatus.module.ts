import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { EduContents, EduContentsSchema } from '../educontents/schemas/educontents.schema';
import { EduStatus, EduStatusSchema } from './schemas/edustatus.schema';
import { QuizResult, QuizResultSchema } from './schemas/quizresult.schema';
import { ReadStory, ReadStorySchema } from './schemas/readstory.schema';
import { StudiedDate, StudiedDateSchema } from './schemas/studieddate.schema';
import { EdustatusController } from './edustatus.controller';
import { EdustatusService } from './edustatus.service';
import { StaticModule } from 'src/static/static.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: EduContents.name, schema: EduContentsSchema }]),
    MongooseModule.forFeature([{ name: EduStatus.name, schema: EduStatusSchema }]),
    MongooseModule.forFeature([{ name: QuizResult.name, schema: QuizResultSchema }]),
    MongooseModule.forFeature([{ name: ReadStory.name, schema: ReadStorySchema }]),
    MongooseModule.forFeature([{ name: StudiedDate.name, schema: StudiedDateSchema }]),
    StaticModule,
  ],
  controllers: [EdustatusController],
  providers: [EdustatusService],
  exports: [EdustatusService],
})
export class EdustatusModule {}