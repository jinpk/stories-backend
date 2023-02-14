import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  now,
  FilterQuery,
  Model,
  PipelineStage,
  ProjectionFields,
  Types,
} from 'mongoose';
import { PagingResDto } from 'src/common/dto/response.dto';
import { LevelTest, LevelTestDocument } from './schemas/leveltest.schema';
import { LevelTestDto } from './dto/leveltest.dto';
import { UpdateLevelTestDto } from './dto/update-leveltest.dto';
import { GetLevelTestDto, GetPagingLevelTestDto } from './dto/get-leveltest.dto';
import { UtilsService } from 'src/common/providers';

@Injectable()
export class LeveltestService {
  constructor(
    private utilsService: UtilsService,
    @InjectModel(LevelTest.name) private leveltestModel: Model<LevelTestDocument>,
  ) {}

  async deleteLevelTest(id: string) {
    await this.leveltestModel.findByIdAndDelete(id);
    return id
  }

  async updateLevelTestById(id: string, body: UpdateLevelTestDto) {
    const leveltest = await this.leveltestModel.findByIdAndUpdate(id, { 
      $set: {body, updatedAt: now()}
    });

    return leveltest._id.toString()
  }

  async existLevelTestById(id: string): Promise<boolean> {
    const leveltest = await this.leveltestModel.findById(id);
    if (!leveltest) {
      return false;
    }
    return true;
  }

  async createLevelTest(body: LevelTestDto): Promise<string> {
    var levelTest: LevelTest = new LevelTest()
    levelTest = {
      level: body.level,
      text: body.text,
      answers: body.answers,
      correct_answer: body.correct_answer,
    }
    const result = await new this.leveltestModel(levelTest).save()
    return result._id.toString()
  }

  async getLevelTestById(id: string): Promise<LevelTestDto> {
    const leveltest = await this.leveltestModel.findById(id);
    return leveltest;
  }

  async getPagingLevelTestsByLevel(
    query: GetPagingLevelTestDto,
  ): Promise<PagingResDto<LevelTestDto> | Buffer> {
    var filter: FilterQuery<LevelTestDocument> = {}
    if (!query.level) {
    } else {
      filter = {
        level: { $eq: query.level },
      };
    }

    console.log(filter)
    const projection: ProjectionFields<LevelTestDto> = {
      _id: 1,
      contentsSerialNum: 1,
      level: 1,
      text: 1,
      answers: 1,
      correct_answer: 1,
    };

    const cursor = await this.leveltestModel.aggregate([
      { $match: filter },
      { $project: projection },
      { $sort: { createdAt: -1 } },
      this.utilsService.getCommonMongooseFacet(query),
    ]);

    const metdata = cursor[0].metadata;
    const data = cursor[0].data;

    return {
      total: metdata[0]?.total || 0,
      data: data,
    };
  }
}
