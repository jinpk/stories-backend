/*
  통계 조회,등록,관리 서비스 함수
  -통계 데이터 조회/업데이트
*/

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  Model,
  Types,
} from 'mongoose';
import { CommonExcelService, UtilsService } from 'src/common/providers';
import { EXCEL_COLUMN_LIST } from './static.constant';
import {
  EduContents,
  EduContentsDocument
} from 'src/educontents/schemas/educontents.schema';
import { UserStatic, UserStaticDocument } from './schemas/userstatic.schema';
import { ReadStory, ReadStoryDocument } from '../edustatus/schemas/readstory.schema';
import { EduStatus, EduStatusDocument } from '../edustatus/schemas/edustatus.schema';
import { ReviewVocab, ReviewVocabDocument } from '../vocabs/schemas/review-vocab.schema';
import { StaticsVocabDto } from './dto/static.dto';
import {
  GetContentsCompleteDto,
  GetVocabQuizDto,
  GetLevelTestResultDto
} from './dto/get-static.dto';

@Injectable()
export class StaticService {
  constructor(
      private commonExcelService: CommonExcelService,
      @InjectModel(UserStatic.name) private userstaticModel: Model<UserStaticDocument>,
      @InjectModel(EduStatus.name) private edustatusModel: Model<EduStatusDocument>,
      @InjectModel(EduContents.name) private educontentsModel: Model<EduContentsDocument>,
      @InjectModel(ReadStory.name) private readstoryModel: Model<ReadStoryDocument>,
      @InjectModel(ReviewVocab.name) private reviewvocabModel: Model<ReviewVocabDocument>,
  ) {}

  /*
  * 회원 가입시 user static 초기화 생성
  * @params:
  *   user_id:            string
  * @return:
  */  
  async createUserStatic(user_id: string) {
    let userStatic = new UserStatic()
    userStatic.userId = new Types.ObjectId(user_id);

    await new this.userstaticModel(userStatic).save();
  }

  /*
  * 컨텐츠 완료율 통계
  * @params:
  *   query:            GetContentsCompleteDto
  * 
  * 액셀추출인 경우
  * @return:            Buffer
  * 액셀추출이 아닌 경우
  * @return:
  *   rates             number
  */    
  async getContentsCompleteStatic(
    query: GetContentsCompleteDto
  ){
    var rates: {[key: string]: {'avgCompleted':number}} = {}

    const start_date = new Date(query.start).toString()
    const end_date = new Date(query.end).toString()

    const docs = await this.readstoryModel.aggregate([
      {
        $match: {
          $expr: {
            $and: [
              { $gte: ['$completedAt', new Date(start_date)] },
              { $lte: ['$completedAt', new Date(end_date)] }
            ],
          },
        },
      },
      {
        $group: {
          _id: { "userId" : '$userId', "level" : '$level' },
          completedCount: {
            $sum: {
              $cond: [{ $eq: ['$completed', true]}, 1, 0],
            }
          },
        },
      },
      {
        $group: {
          _id: '$_id.level',
          completedCount: {
            $sum: '$completedCount'
          },
          userCount: {
            $sum: 1,
          }
        },
      }
    ]);

    // level별 컨텐츠 수
    let contentsCounts = {};
    for (let i=1; i<11; i++) {
      contentsCounts[i.toString()] = 0;
    }

    let contents = await this.educontentsModel.find();

    contents.forEach(element => {
      contentsCounts[element.level] += 1;
    });

    for (let i = 1; i < 11; i++) {
      docs.forEach(doc => {
        if (doc._id == i.toString()) {
          const avgCompleted = (doc.completedCount*100.0/(contentsCounts[i.toString()]*doc.userCount));

          rates[i.toString()] = {
            'avgCompleted': avgCompleted}
        }
      })
    }

    if (query.excel === '1') {
      return await this.staticdataToExcel(rates)
    }

    return rates
  }

  /*
  * 단어 퀴즈 통계
  * @params:
  *   query:            GetVocabQuizDto
  * 
  * 액셀추출인 경우
  * @return:            Buffer
  * 액셀추출이 아닌 경우
  * @return:
  *   rates             number
  */    
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

  /*
  * 레벨 테스트 통계
  * @params:
  *   query:                GetLevelTestResultDto
  * 
  * 액셀추출인 경우
  * @return:            Buffer
  * 액셀추출이 아닌 경우
  * @return:
  *   rates             number
  */    
  async getLevelTestStatic(
    query: GetLevelTestResultDto,
  ){
    var rates: {[key: string]: number} = {}
    var total: number = 0

    const start_date = new Date(query.start).toString()
    const end_date = new Date(query.end).toString()

    const edustatus = await this.edustatusModel.find({
      updatedAt: {
        $gte: new Date(start_date),
        $lte: new Date(end_date)
      }
    });

    total = edustatus.length;

    let userCounts = {}
    for (let i = 1; i < 11; i++) {
      rates[i.toString()] = 0
      userCounts[i.toString()] = 0
    }

    // level별 유저수
    edustatus.forEach(element => {
      userCounts[element.latestLevel] += 1;
    })

    Object.keys(rates).forEach(key => {
        rates[key] = userCounts[key]*100.0/total
      }
    );

    if (query.excel === '1') {
      return await this.staticdataToExcel(rates)
    }

    return rates
  }

  /*
  * 통계 데이터 액셀 변환 함수
  * @params:
  *   data:                object
  * @return: {}            Buffer
  */    
  async staticdataToExcel(data: Object) {
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

  async updateUserStudyTime(user_id: string) {
    await this.userstaticModel.findOneAndUpdate({
      userId: new Types.ObjectId(user_id)
    },
    {
      $inc: {totalStudyTime: 20}
    })
  }

  async updateUserCorrectRate(user_id: string, correct_rate: number) {
    await this.userstaticModel.findOneAndUpdate({
      userId: new Types.ObjectId(user_id)
    },
    {
      correctRate: correct_rate,
    });
  }

  /*
  * 유저 학습컨텐츠 갯수 수정
  * @params:
  *   user_id:                string
  * @return: {}
  */
  async updateUserReadStory(user_id: string) {
    let read_count = await this.readstoryModel.find({
      userId: new Types.ObjectId(user_id),
      completed: true,
    }).count();

    await this.userstaticModel.findOneAndUpdate({
      userId: new Types.ObjectId(user_id)
    },
    {
      read: read_count,
    });
  }


  /*
  * 유저 리뷰 단어 완료갯수 갱신
  * @params:
  *   user_id:                string
  * @return: {}
  * 
  */
  async updateUserWords(user_id: string) {
    let word_count = await this.reviewvocabModel.find({
      userId: new Types.ObjectId(user_id),
      completed: true,
    }).count();

    await this.userstaticModel.findOneAndUpdate({
      userId: user_id
    },
    {
      words: word_count,
    });
  }

  async getUserStaticById(user_id: string) {
    let userStatic = await this.userstaticModel.findOne({
      userId: new Types.ObjectId(user_id)
    });

    if (!userStatic) {
      throw new NotFoundException("유저 학습정보가 없습니다.");
    }

    return userStatic
  }
}