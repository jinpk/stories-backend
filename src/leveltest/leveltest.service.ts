import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { LevelTest, LevelTestDocument } from './schemas/leveltest.schema';

@Injectable()
export class LeveltestService {
    constructor(
        @InjectModel(LevelTest.name) private vocabModel: Model<LevelTestDocument>,
      ) {}
    
      async GetVocab(leveltest_id: string): Promise<LevelTestDocument | false> {
        const vocab = await this.vocabModel.findById(leveltest_id);
        if (!vocab) {
          return false;
        }
        return vocab;
      }
}
