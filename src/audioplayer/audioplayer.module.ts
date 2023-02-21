import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AudioPlayer, AudioPlayerSchema } from './schemas/audioplayer.schema';
import { EduStatus, EduStatusSchema } from '../edustatus/schemas/edustatus.schema';
import { EduContents, EduContentsSchema } from '../educontents/schemas/educontents.schema';
import { Bookmark, BookmarkSchema } from '../educontents/schemas/bookmark.schema';
import { AudioplayerService } from './audioplayer.service';
import { AudioplayerController } from './audioplayer.controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: AudioPlayer.name, schema: AudioPlayerSchema }]),
    MongooseModule.forFeature([{ name: EduStatus.name, schema: EduStatusSchema }]),
    MongooseModule.forFeature([{ name: EduContents.name, schema: EduContentsSchema }]),
    MongooseModule.forFeature([{ name: Bookmark.name, schema: BookmarkSchema }]),
  ],
  controllers: [AudioplayerController],
  providers: [AudioplayerService],
  exports: [AudioplayerService],
})
export class AudioplayerModule {}
