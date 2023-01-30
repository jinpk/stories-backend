import { Module } from '@nestjs/common';
import { LeveltestController } from './leveltest.controller';

@Module({
  controllers: [LeveltestController],
})
export class LeveltestModule {}
