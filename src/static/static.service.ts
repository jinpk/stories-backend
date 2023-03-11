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
import { CommonExcelService, UtilsService } from 'src/common/providers';
import { EXCEL_COLUMN_LIST } from './static.constant';
import { EduStatus, EduStatusDocument } from '../edustatus/schemas/edustatus.schema';
import { ReviewVocab, ReviewVocabDocument } from '../vocabs/schemas/review-vocab.schema';
import { StaticsVocabDto } from './dto/static.dto';
import { GetContentsCompleteDto, GetVocabQuizDto, GetLevelTestResultDto } from './dto/get-static.dto';

@Injectable()
export class StaticService {
    constructor(
        private utilsService: UtilsService,
        private commonExcelService: CommonExcelService,
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

        var rate = 0
        if ((avgAdded == 0) || (avgCompleted == 0)) {
        } else {
          rate = (avgCompleted/avgAdded)*100.0;
        }

        rates[i.toString()] = {
          'avgAdded': avgAdded,
          'avgCompleted': avgCompleted,
          'rate': rate}
      }

      if (query.excel === '1') {
        return await this.staticdataToExcel(rates)
      }

      return rates
    }

    async getVocabQuizStatic(
      query: GetVocabQuizDto,
    ){
      var rates = {}

      const start_date = new Date(query.start).toString()
      const end_date = new Date(query.end).toString()

      const reviewvocab = await this.reviewvocabModel.find({
        "updatedAt": {
          $gte: new Date(start_date),
          $lte: new Date(end_date)
        }
      });

      const staticvocab: StaticsVocabDto = {
        addedVocabCount: 0,
        studiedVocabCount: 0,
        completeRate: 0,
      }

      for (let i = 1; i < 11; i++) {
        rates[i.toString()] = staticvocab
      }

      reviewvocab.forEach((content, _) => {
        var tempData: StaticsVocabDto = {
          addedVocabCount: rates[content.level]['addedVocabCount'] + 1,
          studiedVocabCount: rates[content.level]['studiedVocabCount'],
          completeRate: 0,
        }
        if (content.complete) {
          tempData.studiedVocabCount += 1
        }
        rates[content.level] = tempData;
      });

      Object.keys(rates).forEach(key => {
        if (rates[key].addedVocabCount != 0) {
          rates[key].completeRate = (rates[key].studiedVocabCount / rates[key].addedVocabCount) * 100.0;
        } else {}
      });

      if (query.excel === '1') {
        return await this.staticdataToExcel(rates)
      }

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

      if (query.excel === '1') {
        return await this.staticdataToExcel(rates)
      }

      return rates
    }

    async staticdataToExcel(data: Object) {
      console.log(data)

      var excelData = []
      var rows = Object.keys(data['1'])
      for (const row of rows) {
        var temp = {'LV.1': 0, 'LV.2': 0,'LV.3': 0,'LV.4': 0, 'LV.5': 0, 'LV.6': 0, 'LV.7': 0, 'LV.8': 0, 'LV.9': 0, 'LV.10': 0}
        Object.keys(data).forEach(key => {
          var keyStr = "LV." + key
          temp[keyStr] = data[key][row]
        });
        excelData.push(temp);
      };

      return await this.commonExcelService.listToExcelBuffer(
        EXCEL_COLUMN_LIST,
        excelData,
      );
    }
}
