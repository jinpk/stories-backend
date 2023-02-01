import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Popup, PopupDocument } from './schemas/popup.schema';

@Injectable()
export class PopupService {
    constructor(
        @InjectModel(Popup.name) private popupModel: Model<PopupDocument>,
      ) {}
    
      async GetVocab(popup_id: string): Promise<PopupDocument | false> {
        const popup = await this.popupModel.findById(popup_id);
        if (!popup) {
          return false;
        }
        return popup;
      }
}
