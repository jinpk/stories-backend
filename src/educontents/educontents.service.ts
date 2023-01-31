import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { EduContents, EduContentsDocument } from './schemas/educontents.schema';

@Injectable()
export class EducontentsService {
    constructor(
        @InjectModel(EduContents.name) private educontentsModel: Model<EduContentsDocument>,
      ) {}
    
      async GetEducontents(educontents_id: string): Promise<EduContentsDocument | false> {
        const educontents = await this.educontentsModel.findById(educontents_id);
        if (!educontents) {
          return false;
        }
        return educontents;
      }
}
