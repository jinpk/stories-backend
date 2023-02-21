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
import { UtilsService } from 'src/common/providers';

@Injectable()
export class StaticService {
    constructor(
        utilsService: UtilsService,
    ) {}

    async getLevelTestStatic(){}

    async getVocabQuizStatic(){
    }

    async getContentsCompleteStatic(){}
}
