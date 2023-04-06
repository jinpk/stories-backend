import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  now,
  FilterQuery,
  Model,
  ProjectionFields,
} from 'mongoose';
import { PagingResDto } from 'src/common/dto/response.dto';
import { LevelTest, LevelTestDocument } from './schemas/leveltest.schema';
import { LevelTestDto, LevelTestResultDto } from './dto/leveltest.dto';
import { UpdateLevelTestDto } from './dto/update-leveltest.dto';
import { GetPagingLevelTestDto } from './dto/get-leveltest.dto';
import { UtilsService } from 'src/common/providers';
import { EdustatusService } from '../edustatus/edustatus.service'

@Injectable()
export class LeveltestService {
  constructor(
    private utilsService: UtilsService,
    private edustatusService: EdustatusService,
    @InjectModel(LevelTest.name) private leveltestModel: Model<LevelTestDocument>,
  ) {}

  async postLevelTest(user_id: string, body: LevelTestResultDto) {
    const status = await this.edustatusService.updateEduStatus(user_id, body)

    let dto = this.edustatusService._edustatusToDto(status)
    return dto
  }

  async deleteLevelTest(id: string) {
    await this.leveltestModel.findByIdAndDelete(id);
    return id
  }

  async updateLevelTestById(id: string, body: UpdateLevelTestDto) {
    const leveltest = await this.leveltestModel.findByIdAndUpdate(id, { 
      $set: {
        step: body.step,
        sequence: body.sequence,
        text: body.text,
        answers: body.answers,
        correct_answer: body.correct_answer,
        updatedAt: now()}
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
      step: body.step,
      sequence: body.sequence,
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
    if (!query.step) {
    } else {
      filter = {
        step: { $eq: query.step },
      };
    }

    const projection: ProjectionFields<LevelTestDto> = {
      _id: 1,
      step: 1,
      sequence: 1,
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