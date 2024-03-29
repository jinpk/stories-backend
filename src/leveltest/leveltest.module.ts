import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { LevelTest, LevelTestSchema } from './schemas/leveltest.schema';
import { LeveltestController } from './leveltest.controller';
import { LeveltestService } from './leveltest.service';
import { EdustatusModule } from '../edustatus/edustatus.module';


@Module({
  imports: [
    MongooseModule.forFeature([{ name: LevelTest.name, schema: LevelTestSchema }]),
    EdustatusModule,
  ],
  controllers: [LeveltestController],
  providers: [LeveltestService],
  exports: [LeveltestService],
})
export class LeveltestModule {}
