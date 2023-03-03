import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Popup, PopupSchema } from './schemas/popup.schema';
import { PopupController } from './popup.controller';
import { PopupService } from './popup.service';


@Module({
  imports: [
    MongooseModule.forFeature([{ name: Popup.name, schema: PopupSchema }]),
  ],
  controllers: [PopupController],
  providers: [PopupService],
  exports: [PopupService],

})
export class PopupModule {}
