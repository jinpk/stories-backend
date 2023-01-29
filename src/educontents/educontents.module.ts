import { Module } from '@nestjs/common';
import { EducontentsController } from './educontents.controller';

@Module({
  controllers: [EducontentsController],
})
export class EducontentsModule {}
