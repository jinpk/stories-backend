import { Module } from '@nestjs/common';
import { FaqboardController } from './faqboard.controller';

@Module({
  controllers: [FaqboardController]
})
export class FaqboardModule {}
