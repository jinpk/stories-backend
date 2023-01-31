import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { EduContents, EduContentsSchema } from './schemas/educontents.schema';
import { EducontentsController } from './educontents.controller';
import { EducontentsService } from './educontents.service';

@Module({
    imports: [
      MongooseModule.forFeature([{ name: EduContents.name, schema: EduContentsSchema }]),
    ],
    controllers: [EducontentsController],
    providers: [EducontentsService],
    exports: [EducontentsService],
  })
  export class EducontentsModule {}