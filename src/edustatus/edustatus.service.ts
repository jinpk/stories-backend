/*
  학습상태 조회,등록,관리 서비스 함수
  -학습상태 등록, 조회
  -레벨테스트 결과 등록
  -단어 퀴즈 조회/업데이트
  -읽은 컨텐츠 등록/조회
*/

import {
  Injectable,
  NotAcceptableException,
  NotFoundException
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  now,
  FilterQuery,
  Model,
  PipelineStage,
  ProjectionFields,
  Types,
} from 'mongoose';
import { EduContents, EduContentsDocument } from '../educontents/schemas/educontents.schema';
import { EduStatus, EduStatusDocument } from './schemas/edustatus.schema';
import { QuizResult, QuizResultDocument } from './schemas/quizresult.schema';
import { ReadStory, ReadStoryDocument } from './schemas/readstory.schema';
import { StudiedDate, StudiedDateDocument } from './schemas/studieddate.schema';
import { 
  EduStatusDto,
  LevelProgressDetail,
  CertificateDto,
  HomeInfoDto,
  CertificateDetailDto,
} from './dto/edustatus.dto';
import { GetStudiedDateDto } from './dto/get-edustatus.dto';
import { UpdateEduCompleted } from './dto/update-edustatus.dto';
import { LevelTestResultDto } from 'src/leveltest/dto/leveltest.dto';
import { ReadStoryDto } from './dto/readstory.dto';
import { StaticService } from 'src/static/static.service';
import { QuizResultDto } from './dto/quizresult.dto';
import * as dayjs from 'dayjs';

@Injectable()
export class EdustatusService {
  constructor(
    @InjectModel(EduStatus.name) private edustatusModel: Model<EduStatusDocument>,
    @InjectModel(QuizResult.name) private quizresultModel: Model<QuizResultDocument>,
    @InjectModel(ReadStory.name) private readstoryModel: Model<ReadStoryDocument>,
    @InjectModel(EduContents.name) private educontentsModel: Model<EduContentsDocument>,
    @InjectModel(StudiedDate.name) private studieddateModel: Model<StudiedDateDocument>,
    
    private staticService: StaticService,
  ) {}

  /*
  * 유저 학습상태 조회 by Id
  * @params:
  *   user_id:              string
  * @return: 
  *   edustatus             EduStatusDto
  */
  async getEduStatusById(user_id: string) {
    const filter: FilterQuery<EduStatusDto> = {
      userId: new Types.ObjectId(user_id),
    };

    const lookups: PipelineStage[] = [
      {
        $lookup: {
          from: 'readstories',
          localField: 'userId',
          foreignField: 'userId',
          as: 'readstories',
        },
      },
      {
        $unwind: {
          path: '$readstories',
          preserveNullAndEmptyArrays: false,
        },
      },
    ];

    const projection: ProjectionFields<EduStatusDto> = {
      _id: 0,
      id: '$coupons._id',
      userCouponId: '$_id',
      nickname: '$users.nickname',
      name: '$coupons.name',
      description: '$coupons.description',
      type: '$coupons.type',
      start: '$coupons.start',
      end: '$coupons.end',
      storeId: '$coupons.storeId',
      value: '$coupons.value',
      userId: 1,
      createdAt: 1,
      used: {
        $cond: [{ $gte: [{ $size: '$subscriptions' }, 1] }, true, false],
      },
    };

    var edustatus =  await this.edustatusModel.aggregate([
      { $match: filter},
      ...lookups,
      { $project: projection}
    ]);

    return edustatus
  }

  /*
  * 홈화면 정보 조회
  * @params:
  *   user_id:              string
  * @return: 
  *   dto                   HomeInfoDto
  */
  async getHomeinfoByUserId(user_id: string) {
    const filter: FilterQuery<EduStatusDto> = {
      userId: new Types.ObjectId(user_id),
    };

    const lookups: PipelineStage[] = [
      {
        $lookup: {
          from: 'readstories',
          let: { user_id: '$userId', sel_level: '$selectedLevel' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    {$eq: ['$userId', '$$user_id']},
                    {$eq: ['$level', '$$sel_level']},
                  ]
                },
              },
            },
          ],
          as: 'readstories',
        },
      },
      {
        $unwind: {
          path: '$readstories',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $sort: {'readstories.lastReadAt': -1}
      },
      {
        $lookup: {
          from: 'educontents',
          localField: 'readstories.eduContentsId',
          foreignField: '_id',
          as: 'contents'
        }
      },
      {
        $unwind: {
          path: '$contents',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          'readstories._id': 0,
          'readstories.__v': 0,
          'readstories.level': 0,
          'readstories.userId': 0,
          'readstories.eduContentsId': 0,
          'readstories.contentsSerialNum': 0,
          'readstories.createdAt': 0,
          'readstories.updatedAt': 0,
        }
       },
      {
       $project: {
        'contents.__v': 0,
        'contents.level': 0,
        'contents.vocabCount': 0,
        'contents.questionCount': 0,
        'contents.timeLine': 0,
        'contents.createdAt': 0,
        'contents.updatedAt': 0,
       }
      },
    ];

    const projection: ProjectionFields<HomeInfoDto> = {
      _id: 0,
      userId: 1,
      selectedLevel: 1,
      contents: 1,
      readstories: 1,
    };

    var cursor =  await this.edustatusModel.aggregate([
      { $match: filter},
      ...lookups,
      { $project: projection}
    ]);

    if (cursor.length == 0) {
      throw new NotFoundException('Not found user homeinfo')
    }
    
    let dto: HomeInfoDto = new HomeInfoDto();

    dto.selectedLevel = cursor[0].selectedLevel
    dto.seriesTotal = 0
    dto.articleTotal = 0
    dto.seriesCompleted = 0
    dto.articleCompleted = 0

    let levelContents = await this.educontentsModel.aggregate([
      {
        $match: { level: dto.selectedLevel },
      },
      {
        $sort: { storyIndex: 1, seriesNum : 1 }
      },
      {
        $project: {
         '__v': 0,
         'level': 0,
         'vocabCount': 0,
         'questionCount': 0,
         'timeLine': 0,
         'createdAt': 0,
         'updatedAt': 0,
        }
      }
    ])

    levelContents.forEach(element => {
      if (element.contentsSerialNum.includes('a' || 'A')) {
        dto.articleTotal += 1;
        if (!dto.recentArticle) {
          dto.recentArticle = element;
        }
      }
      if (element.contentsSerialNum.includes('s' || 'S')) {
        dto.seriesTotal += 1;
        if (!dto.recentSeries) {
          dto.recentSeries = element;
        }
      }
    })

    cursor.forEach(element => {
      if (element.contents) {
        if (element.contents.contentsSerialNum.includes('a' || 'A')) {
          if (element.readstories.completed) {
            dto.articleCompleted += 1
          }
          if (dto.recentArticle == null) {
            dto.recentArticle = element.contents
          }
        }
        if (element.contents.contentsSerialNum.includes('s' || 'S')) {
          if (element.readstories.completed) {
            dto.seriesCompleted += 1
          }
          if (dto.recentSeries == null) {
            dto.recentSeries = element.contents
          }
        }
      } else {
      }
    });

    return dto
  }

  /*
  * 사용자 학습상태 유무
  * @params:
  *   user_id:              string
  * @return: 
  *   true || false         boolean
  */
  async existEdustatus(user_id: string): Promise<boolean> {
    const edustatus = await this.edustatusModel.findOne({
      userId: new Types.ObjectId(user_id),
    });
    if (!edustatus) {
        return false
    }
      return true
  }

  /*
  * 사용자 레벨 설정 변경(홈화면)
  * @params:
  *   user_id:              string
  *   level:                string
  * @return: 
  *   edustatus:           EduStatusDto
  */
  async changeSelectedLevel(user_id, level: string): Promise<EduStatusDto> {
    const edustatus = await this.edustatusModel.findOneAndUpdate({
      userId: new Types.ObjectId(user_id),
    }, {
      $set: {
        selectedLevel: level,
      }
    });

    let dto = this._edustatusToDto(edustatus);

    return dto
  }

  /*
  * 읽은 컨텐츠 수정/저장
  * @params:
  *   user_id:              string
  *   body:                 UpdateEduCompleted
  * @return: 
  *   readstory:           ReadStoryDto
  */
  async updateUserCompleted(
    user_id: string,
    body: UpdateEduCompleted): Promise<ReadStoryDto> {
    const content = await this.educontentsModel.findOne({
      _id: new Types.ObjectId(body.contentId),
    });

    if (!content) {
      throw new NotFoundException('Not found educontents')
    }

    if (body.completed) {
      const exist = await this.readstoryModel.findOne({
        userId: new Types.ObjectId(user_id),
        completed: true,
        eduContentsId: new Types.ObjectId(body.contentId),
        contentsSerialNum: body.contentsSerialNum,
      })

      if (exist) {
        throw new NotAcceptableException('Already completed.')
      }

      const readStory = await this.readstoryModel.findOneAndUpdate(
        {
          userId: new Types.ObjectId(user_id),
          eduContentsId: new Types.ObjectId(body.contentId),
          contentsSerialNum: body.contentsSerialNum,
        },
        {
          completed: true,
        }
      );

      let dto = this._readstoryToDto(readStory)
      return dto;

    } else {
      const exist = await this.readstoryModel.findOne({
        userId: new Types.ObjectId(user_id),
        eduContentsId: new Types.ObjectId(body.contentId),
        contentsSerialNum: body.contentsSerialNum,
      })

      if (exist) {
        throw new NotAcceptableException('Already registered.')
      }

      var story_result: ReadStory = new ReadStory()
      story_result = {
        userId: new Types.ObjectId(user_id),
        level: body.level,
        completed: false,
        eduContentsId: new Types.ObjectId(body.contentId),
        contentsSerialNum: body.contentsSerialNum,
        lastReadAt: now(),
      }

      const readStory = await new this.readstoryModel(story_result).save();

      let dto = this._readstoryToDto(readStory)

      // 출석
      await this.createStudiedDates(user_id);
      
      return dto;
    }
  }

  /*
  * 레벨 테스트 결과 계산
  * @params:
  *   step:                 string
  *   correct:              number
  * @return: 
  *   calculatedlevel:           string
  */
  async calculateLevel(step: string, correct: number): Promise<string> {
    const step_num: number = +step;

    var calculatedlevel = '1'
    const uncorrect = step_num*4 - correct;

    switch ( step ) {
      case "2":
        if (uncorrect >= 2) {
          calculatedlevel = '2'
        } else {
          calculatedlevel = '3'
        }
        break;
      case "3":
        if (uncorrect >= 2) {
          calculatedlevel = '4'
        } else {
          calculatedlevel = '5'
        }
        break;
      case "4":
        if (uncorrect >= 2) {
          calculatedlevel = '6'
        } else {
          calculatedlevel = '7'
        }
        break;
      case "5":
        if (uncorrect == 0) {
          calculatedlevel = '10'
        } else if (uncorrect == 1) {
          calculatedlevel = '9'
        } else if (uncorrect >= 2){
          calculatedlevel = '8'
        }
        break;
      default:
        break;
   }

    return calculatedlevel
  }

  /*
  * 학습 상태 생성
  * @params:
  *   user_id:              string
  *   body:                 LevelTestResultDto
  * @return: 
  *   firstLevel:           string
  *   latestLevel:          string
  *   selectedLevel:        string
  *   levelProgress:        object
  *   userId:               string
  *   createdAt:            Date
  */
  async createEduStatus(user_id: string, body: LevelTestResultDto) {
    var calculatedLevel = '1'

    if (!(await this.existEdustatus(user_id))) {
    }else{}

    calculatedLevel = await this.calculateLevel(body.step, body.lastStepCorrect)

    const article_count = await this.educontentsModel.find({
      level: { $eq: calculatedLevel },
      contentsSerialNum: { $regex: 'A', $options: 'i' },
    }).count();

    const series_count = await this.educontentsModel.find({
      level: { $eq: calculatedLevel },
      contentsSerialNum: { $regex: 'S', $options: 'i' },
    }).count();

    var cur_progress: LevelProgressDetail = new LevelProgressDetail();
    cur_progress = {
      articleTotal: article_count,
      seriesCompleted: [],
      seriesTotal: series_count,
      articleCompleted: [],
      quizResult: {correct: 0, total: 0},
      updatedAt: now(),
    }

    let progress_key = "level" + calculatedLevel

    let lvl_progress = {}
    lvl_progress[progress_key] = cur_progress
    
    var edustatus: EduStatus = new EduStatus();
    edustatus = {
      userId: new Types.ObjectId(user_id),
      firstLevel: calculatedLevel,
      latestLevel: calculatedLevel,
      selectedLevel: calculatedLevel,
      levelProgress: lvl_progress,
    }

    const result = await new this.edustatusModel(edustatus).save();

    await this.staticService.createUserStatic(user_id);

    return result; 
  }

  /*
  * 학습상태 업데이트
  * @params:
  *   user_id:              string
  *   body:                 LevelTestResultDto
  * @return: 
  *   firstLevel:           string
  *   latestLevel:          string
  *   selectedLevel:        string
  *   levelProgress:        object
  *   userId:               string
  *   createdAt:            Date
  */
  async updateEduStatus(user_id: string, body: LevelTestResultDto) {
    let exist = await this.existEdustatus(user_id);
    if (exist) {
    }else{
      return await this.createEduStatus(user_id, body);
    }

    const calculatedLevel = await this.calculateLevel(body.step, body.lastStepCorrect)

    const result = await this.edustatusModel.findOneAndUpdate({
      userId: new Types.ObjectId(user_id)
    },
    { 
      $set: {
        latestLevel: calculatedLevel,
        selectedLevel: calculatedLevel,
        updatedAt: now()
      }
    });

    return result; 
  }

  /*
  * 완료한 스토리/아티클 저장
  * @params:
  *   user_id:              string
  *   serial_num            string
  * @return: 
  *   readstory_count:      number
  */
  async createReadStory(user_id: string, body: UpdateEduCompleted) {
    var story_result: ReadStory = new ReadStory()
    story_result = {
      userId: new Types.ObjectId(user_id),
      level: body.level,
      completed: false,
      eduContentsId: new Types.ObjectId(body.contentId),
      contentsSerialNum: body.contentsSerialNum,
      lastReadAt: now(),
    }

    const result = await new this.readstoryModel(story_result).save();

    // 출석
    await this.createStudiedDates(user_id);

    return result;
  }

  /*
  * 읽은 스토리 카운트
  * @params:
  *   user_id:              string
  *   serial_num            string
  * @return: 
  *   readstory_count:      number
  */
  async getReadStoriesCount(user_id, serial_num: string) {
    const readstory_count = await this.readstoryModel.find({
      userId: { $eq: user_id },
      contentsSerialNum: { $eq: serial_num}
    }).count();

    return readstory_count
  }

  /*
  * 읽은 스토리 조회
  * @params:
  *   user_id:              string
  * @return: 
  *   id:                   string
  *   userId:               string
  *   level:                string
  *   eduContentsId:        string
  *   contentsSerialNum     string
  *   completed:            boolean
  *   completedAt:          Date
  *   lastedReadAt:         Date
  */
  async getReadStories(user_id: string) {
    const readstory = await this.readstoryModel.find({
      userId: { $eq: user_id },
    });

    return readstory
  }

  /*
  * 퀴즈 결과 저장
  * @params:
  *   user_id:              string
  *   body:                 QuizResultDto
  * @return: 
  *   id:                   string
  */
  async createQuizResult(user_id: string, body: QuizResultDto): Promise<string> {
    var quizresult: QuizResult = new QuizResult();
    quizresult = {
      userId: new Types.ObjectId(user_id),
      quizId: new Types.ObjectId(body.quizId),
      corrected: body.corrected,
    }

    const result = await new this.quizresultModel(quizresult).save();

    // userstatic correctRate update
    let correct_rate = await this.getQuizCorrectResult(user_id);

    await this.staticService.updateUserCorrectRate(user_id, correct_rate['rate']);
    
    return result._id.toString();
  }

  /*
  * 퀴즈 결과 조회
  * @params:
  *   user_id:              string
  * @return: {
  *   total:                number
  *   correct:              number
  *   rate:                 number
  * }
  */
  async getQuizCorrectResult(user_id: string) {
    const total_quiz_result = await this.quizresultModel.find({
      userId: { $eq: new Types.ObjectId(user_id) },
    }).count();

    const correct_quiz_result = await this.quizresultModel.find({
      userId: { $eq: new Types.ObjectId(user_id) },
      corrected: { $eq: true },
    }).count();

    const correct_rate = (correct_quiz_result/total_quiz_result)*100

    const res ={
      total: total_quiz_result,
      correct: correct_quiz_result,
      rete: Number(correct_rate.toFixed(0))
    }

    return res
  }

  /*
  * 퀴즈 완료 갯수 조회
  * @params:
  *   user_id:              string
  * @return:
  *   quiz_result:          number
  */
  async getMasteredVocabs(user_id: string) {
    const matered_quiz_result = await this.quizresultModel.find({
      userId: { $eq: user_id },
      corrected: { $eq: true },
    }).count();

    return matered_quiz_result
  }

  /*
  * 유저별 Certificate 조회
  * @params:
  *   user_id:              string
  * @return: [
  *   {
  *     certificate         CertificateDto[]
  *   }
  * ]
  */
  async getUserCertificates(user_id: string): Promise<CertificateDto[]> {
    let readContents = await this.readstoryModel.find({
      userId: new Types.ObjectId(user_id),
      completed: true,
    });

    let educontents = await this.educontentsModel.find();

    var certificates: CertificateDto[] = []
    for (let i=1; i < 11; i++) {
      let levelStr = i.toString();
      let cert:CertificateDto = {level: levelStr, completion: false}

      let total = educontents.filter(element => element.level == levelStr)
      let complete = readContents.filter(element => element.level == levelStr)

      if (total.length == complete.length) {
        cert.completion = true;
      }

      certificates.push(cert)
    }

    return certificates
  }

  /*
  * 학습 정보 날짜 조회
  * @params:
  *   user_id:              string
  *   query:                GetReadStoryDto
  * @return: [
  *   {
  *     eduContentId        string
  *     contentSerialNum    string
  *     completed           boolean
  *     completedAt         Date
  *     lastReadAt          Date
  *   }
  * ]
  */
  async getUserCertificateDetail(
    user_id, level: string): Promise<CertificateDetailDto> {
      let readContents = await this.readstoryModel.find({
        userId: new Types.ObjectId(user_id),
        completed: true,
        level: level,
      }).sort({ completedAt: -1});

      let educontentsCount = await this.educontentsModel.find({
        level: level,
      }).count();

      if ((readContents.length == educontentsCount) && (readContents.length != 0)) {
        let dto = new CertificateDetailDto()
        dto.level = level;
        dto.completedAt = readContents[0].completedAt;
        dto.completion = true;
        return dto
      } else {
        throw new NotAcceptableException('Not completed Level')
      }
  }

  /*
  * 학습 정보 날짜 조회
  * @params:
  *   user_id:              string
  *   query:                GetReadStoryDto
  * @return: [
  *   {
  *     eduContentId        string
  *     contentSerialNum    string
  *     completed           boolean
  *     completedAt         Date
  *     lastReadAt          Date
  *   }
  * ]
  */
  async getStudiedDates(user_id: string, query: GetStudiedDateDto) {
    const start_date = new Date(query.start).toString()
    const end_date = new Date(query.end).toString()

    const filter: FilterQuery<StudiedDate> = {
      userId: new Types.ObjectId(user_id),
      createdAt: {
        $gte: new Date(start_date),
        $lte: new Date(end_date)
      }
    };

    const projection: ProjectionFields<StudiedDate> = {
      _id: 0,
      createdAt: 1,
    };

    var cursor =  await this.studieddateModel.aggregate([
      { $match: filter},
      { $project: projection}
    ]);

    return cursor
  }

  async createStudiedDates(user_id: string) {
    const datestr = dayjs().format('YYYY-MM-DD')

    var exist =  await this.studieddateModel.findOne({
      userId: new Types.ObjectId(user_id),
      dayStr: datestr,
    })

    if (exist) {
    } else {
      var studied_date = new StudiedDate()
      studied_date.userId = new Types.ObjectId(user_id)
      studied_date.dayStr = datestr

      await new this.studieddateModel(studied_date).save();
    }
  }
  /*
  * Schema to dto 변환
  * @params:
  *   doc:                EduStatusDocument
  * @return: {
  *   dto:               EduStatusDto
  */
  _edustatusToDto(doc: EduStatus | EduStatusDocument): EduStatusDto {
    const dto = new EduStatusDto();
    dto.id = doc._id.toHexString();
    dto.userId = doc.userId.toHexString();
    dto.firstLevel = doc.firstLevel;
    dto.latestLevel = doc.latestLevel;
    dto.selectedLevel = doc.latestLevel;

    return dto
  }

  /*
  * Schema to dto 변환
  * @params:
  *   doc:                ReadStoryDocument
  * @return: {
  *   dto:               ReadStoryDto
  */
  _readstoryToDto(doc: ReadStory | ReadStoryDocument): ReadStoryDto {
    const dto = new ReadStoryDto();
    dto.id = doc._id.toHexString();
    dto.completed = doc.completed;
    dto.completedAt = doc.completedAt;
    dto.contentsSerialNum = doc.contentsSerialNum;
    dto.eduContentsId = doc.eduContentsId.toHexString();
    dto.lastReadAt = doc.lastReadAt;
    dto.level = doc.level;

    return dto
  }
}