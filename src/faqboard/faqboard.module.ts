import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FaqBoard, FaqBoardSchema } from './schemas/faqboard.schema';
import { FaqCategory, FaqCategorySchema } from './schemas/faqcategory.schema';
import { FaqboardController } from './faqboard.controller';
import { FaqboardService } from './faqboard.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: FaqBoard.name, schema: FaqBoardSchema }]),
    MongooseModule.forFeature([{ name: FaqCategory.name, schema: FaqCategorySchema }]),
  ],
  controllers: [FaqboardController],
  providers: [FaqboardService],
  exports: [FaqboardService],
})
export class FaqboardModule {}
