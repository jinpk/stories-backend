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
import { EduStatus, EduStatusDocument } from './schemas/edustatus.schema';
import { EduStatusDto, Statics, LevelCompleteRate, LevelTestResultDto } from './dto/edustatus.dto';

@Injectable()
export class EdustatusService {
  constructor(
    @InjectModel(EduStatus.name) private edustatusModel: Model<EduStatusDocument>,
  ) {}

  async getEduStatusById(user_id: string): Promise<EduStatusDto> {
    return await this.edustatusModel.findOne({user_id});
  }

  async updateEduStatus(user_id: string, body: EduStatusDto): Promise<string> {
    const eduprogress = await this.edustatusModel.findOne({user_id});
    if (!eduprogress) {
    } else {
      const id = eduprogress._id.toString();
      await this.edustatusModel.findByIdAndUpdate(id, { 
        $set: {body, updatedAt: now()}
      });

      return id
    }
  }

  async existEdustatus(user_id: string): Promise<boolean> {
    const edustatus = await this.edustatusModel.findOne({user_id});
    if (!edustatus) {
        return false
    }
      return true
  }

  async updateUserHighestLevel(user_id: string, level: string): Promise<string> {
    const result = await this.edustatusModel.findOneAndUpdate({user_id}, { 
        $set: {highestLevel: level, updatedAt: now()}
    });
    return result._id.toString();
  }

  async updateUserEduLevel(user_id: string, body: LevelCompleteRate[]): Promise<string> {
    const result = await this.edustatusModel.findOneAndUpdate({user_id}, { 
        $set: {levelCompleteRate: body, updatedAt: now()}
    });
    return result._id.toString();
  }

  async updateUserEduStatic(user_id: string, body: Statics): Promise<string> {
    const result = await this.edustatusModel.findOneAndUpdate({user_id}, { 
    $set: {static: body, updatedAt: now()}
    });

    return result._id.toString();
    }

  async createEduStatus(user_id: string, body: LevelTestResultDto): Promise<string> {
    var edustatus: EduStatus = new EduStatus();
    edustatus = {
      firstLevel: body.level,
      levelProgress: [],
      highestLevel: body.level,
      selectedLevel: body.level,
      levelCompleteRate: [],
      statics: {total: 0, read: 0, correctRate:0, words:0},
      recentArticle: {contentsId:'',contentsSerialNum:'',title:''},
      recentSeries: {contentsId:'',contentsSerialNum:'',title:'', current:0, total:0},
      userId: user_id,
    }
    const result = await new this.edustatusModel(edustatus).save();
    return result._id.toString(); 
  }
}
