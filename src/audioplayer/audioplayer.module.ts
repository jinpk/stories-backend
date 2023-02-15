import { Module } from '@nestjs/common';
import { AudioplayerController } from './audioplayer.controller';

@Module({
  controllers: [AudioplayerController]
})
export class AudioplayerModule {}
