import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ReadStory, ReadStorySchema } from '../edustatus/schemas/readstory.schema';
import { EduContents, EduContentsSchema } from '../educontents/schemas/educontents.schema';
import { Bookmark, BookmarkSchema } from '../educontents/schemas/bookmark.schema';
import { AudioplayerService } from './audioplayer.service';
import { AudioplayerController } from './audioplayer.controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: EduContents.name, schema: EduContentsSchema }]),
    MongooseModule.forFeature([{ name: Bookmark.name, schema: BookmarkSchema }]),
    MongooseModule.forFeature([{ name: ReadStory.name, schema: ReadStorySchema }]),
  ],
  controllers: [AudioplayerController],
  providers: [AudioplayerService],
  exports: [AudioplayerService],
})
export class AudioplayerModule {}
