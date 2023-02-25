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
import { EduStatus, EduStatusDocument } from '../edustatus/schemas/edustatus.schema';
import { GetContentsCompleteDto, GetVocabQuizDto, GetLevelTestResultDto } from './dto/get-static.dto';
import { UtilsService } from 'src/common/providers';

@Injectable()
export class StaticService {
    constructor(
        utilsService: UtilsService,
        @InjectModel(EduStatus.name) private edustatusModel: Model<EduStatusDocument>,
    ) {}

    async getContentsCompleteStatic(
      query: GetContentsCompleteDto
    ){
      const edustatus = await this.edustatusModel.find({});

      edustatus.forEach((content, _) => {
        content.levelProgress
      })

      console.log(edustatus)
    }

    async getVocabQuizStatic(){
    }

    async getLevelTestStatic(){}
}
