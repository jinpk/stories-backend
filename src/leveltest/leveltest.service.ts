import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { LevelTest, LevelTestDocument } from './schemas/leveltest.schema';

@Injectable()
export class LeveltestService {
    constructor(
        @InjectModel(LevelTest.name) private leveltestModel: Model<LevelTestDocument>,
      ) {}
    
      async GetVocab(leveltest_id: string): Promise<LevelTestDocument | false> {
        const leveltest = await this.leveltestModel.findById(leveltest_id);
        if (!leveltest) {
          return false;
        }
        return leveltest;
      }
}
