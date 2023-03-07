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
import { ReviewVocab, ReviewVocabDocument } from '../vocabs/schemas/review-vocab.schema';
import { StaticsVocabDto } from './dto/static.dto';
import { GetContentsCompleteDto, GetVocabQuizDto, GetLevelTestResultDto } from './dto/get-static.dto';
import { UtilsService } from 'src/common/providers';

@Injectable()
export class StaticService {
    constructor(
        utilsService: UtilsService,
        @InjectModel(EduStatus.name) private edustatusModel: Model<EduStatusDocument>,
        @InjectModel(ReviewVocab.name) private reviewvocabModel: Model<ReviewVocabDocument>,
    ) {}

    async getContentsCompleteStatic(
      query: GetContentsCompleteDto
    ){
      var completed: {[key: string]: any} = {}
      var added: {[key: string]: any} = {}
      var rates: {[key: string]: {'avgAdded':number, 'avgCompleted':number, 'rate':number}} = {}

      const start_date = new Date(query.start).toString()
      const end_date = new Date(query.end).toString()

      const edustatus = await this.edustatusModel.find({
        "currentLevel.updatedAt": {
          $gte: new Date(start_date),
          $lte: new Date(end_date)
        }
      });

      const count = edustatus.length;

      for (let i = 1; i < 11; i++) {
        added[i.toString()] = 0
        completed[i.toString()] = 0
      }

      edustatus.forEach((content, _) => {
        added[content.currentLevel.level] += content.currentLevel.total;
        completed[content.currentLevel.level] += content.currentLevel.completed;
      });

      for (let i = 1; i < 11; i++) {
        const avgAdded = added[i.toString()]/count;
        const avgCompleted = completed[i.toString()]/count;
        const rate = (avgCompleted/avgAdded)*100.0;
        rates[i.toString()] = {
          'avgAdded': avgAdded,
          'avgCompleted': avgCompleted,
          'rate': rate}
      }

      return rates
    }

    async getVocabQuizStatic(
      query: GetVocabQuizDto,
    ){
      var rates: {[key: string]: any} = {}

      const start_date = new Date(query.start).toString()
      const end_date = new Date(query.end).toString()

      const reviewvocab = await this.reviewvocabModel.find({
        "updatedAt": {
          $gte: new Date(start_date),
          $lte: new Date(end_date)
        }
      });

      var staticvocab: StaticsVocabDto = new StaticsVocabDto();
      staticvocab = {
        addedVocabCount: 0,
        studiedVocabCount: 0,
        completeRate: 0,
      }

      for (let i = 1; i < 11; i++) {
        rates[i.toString()] = staticvocab
      }

      reviewvocab.forEach((content, _) => {
        rates[content.level].addedVocabCount += 1
        if (content.complete) {
          rates[content.level].studiedVocabCount += 1
        }
      });

      Object.keys(rates).forEach(key => {
        if (rates[key].addedVocabCount != 0) {
          rates[key].completeRate = (rates[key].studiedVocabCount / rates[key].addedVocabCount) * 100.0;
        } else {}
      });

      return rates
    }

    async getLevelTestStatic(
      query: GetLevelTestResultDto,
    ){
      var rates: {[key: string]: number} = {}
      var total: number = 0

      const start_date = new Date(query.start).toString()
      const end_date = new Date(query.end).toString()

      const edustatus = await this.edustatusModel.find({
        "currentLevel.updatedAt": {
          $gte: new Date(start_date),
          $lte: new Date(end_date)
        }
      });

      for (let i = 1; i < 11; i++) {
        rates[i.toString()] = 0
      }

      edustatus.forEach((content, _) => {
        total += 1;
        rates[content.currentLevel.level] += 1;
      })

      Object.keys(rates).forEach(key => {
        if (rates[key] != 0) {
          rates[key] = (rates[key] / total) * 100.0;
        } else {}
      });

      return rates
    }
}
