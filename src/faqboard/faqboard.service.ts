import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { FaqBoard, FaqBoardDocument } from './schemas/faqboard.schema';

@Injectable()
export class FaqboardService {
    constructor(
        @InjectModel(FaqBoard.name) private faqboardModel: Model<FaqBoardDocument>,
      ) {}
    
      async GetFaq(faqboard_id: string): Promise<FaqBoardDocument | false> {
        const faqboard = await this.faqboardModel.findById(faqboard_id);
        if (!faqboard) {
          return false;
        }
        return faqboard;
      }

      async existFaqById(id: string): Promise<boolean> {
        const faqboard = await this.faqboardModel.findById(id);
        if (!faqboard) {
          return false;
        }
        return true;
      }
}
