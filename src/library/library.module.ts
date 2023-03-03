import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ReadStory, ReadStorySchema } from '../edustatus/schemas/readstory.schema';
import { EduContents, EduContentsSchema } from '../educontents/schemas/educontents.schema';
import { Bookmark, BookmarkSchema } from '../educontents/schemas/bookmark.schema';
import { LibraryController } from './library.controller';
import { LibraryService } from './library.service';

@Module({
    imports: [
      MongooseModule.forFeature([{ name: EduContents.name, schema: EduContentsSchema }]),
      MongooseModule.forFeature([{ name: Bookmark.name, schema: BookmarkSchema }]),
      MongooseModule.forFeature([{ name: ReadStory.name, schema: ReadStorySchema }]),
    ],
    controllers: [LibraryController],
    providers: [LibraryService],
    exports: [LibraryService],
  })
export class LibraryModule {}
