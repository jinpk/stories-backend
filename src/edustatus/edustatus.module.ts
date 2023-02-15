import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { EduStatus, EduStatusSchema } from './schemas/edustatus.schema';
import { EdustatusController } from './edustatus.controller';
import { EdustatusService } from './edustatus.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: EduStatus.name, schema: EduStatusSchema }]),
  ],
  controllers: [EdustatusController],
  providers: [EdustatusService],
  exports: [EdustatusService],
})
export class EdustatusModule {}