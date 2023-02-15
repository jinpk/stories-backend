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
import { EduStatusDto } from './dto/edustatus.dto';
import { AwsService } from '../aws/aws.service';

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
      return await this.createEduStatus(body);
    } else {
      const id = eduprogress._id.toString();
      await this.edustatusModel.findByIdAndUpdate(id, { 
        $set: {body, updatedAt: now()}
      });

      return id
    }
  }

  async createEduStatus(body: EduStatusDto): Promise<string> {
    var eduprogress: EduStatusDto = new EduStatusDto();
    eduprogress = {
      firstLevel: body.firstLevel,
      levelProgress: body.levelProgress,
      highestLevel: body.highestLevel,
      recentArticle: body.recentArticle,
      recentSeries: body.recentSeries,
      selectedLevel: body.selectedLevel,
      statics: body.statics,
      levelCompleteRate: body.levelCompleteRate,
    }
    const result = await new this.edustatusModel(eduprogress).save();
    return result._id.toString(); 
  }
}
