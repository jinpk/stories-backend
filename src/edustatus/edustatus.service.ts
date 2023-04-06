import { Injectable, Body, NotAcceptableException, NotFoundException } from '@nestjs/common';
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
import { EduContents, EduContentsDocument } from '../educontents/schemas/educontents.schema';
import { EduStatus, EduStatusDocument } from './schemas/edustatus.schema';
import { QuizResult, QuizResultDocument } from './schemas/quizresult.schema';
import { ReadStory, ReadStoryDocument } from './schemas/readstory.schema';
import { 
  EduStatusDto,
  LevelProgressDetail,
  LevelProgress,
  CertificateDto,
  HomeInfoDto,
  CertificateDetailDto,
} from './dto/edustatus.dto';
import { GetReadStoryDto } from './dto/get-readstory.dto';
import { UpdateEduStatusDto, UpdateEduCompleted } from './dto/update-edustatus.dto';
import { LevelTestResultDto } from 'src/leveltest/dto/leveltest.dto';
import { GetCertificateDetailDto } from './dto/get-edustatus.dto';

@Injectable()
export class EdustatusService {
  constructor(
    @InjectModel(EduStatus.name) private edustatusModel: Model<EduStatusDocument>,
    @InjectModel(QuizResult.name) private quizresultModel: Model<QuizResultDocument>,
    @InjectModel(ReadStory.name) private readstoryModel: Model<ReadStoryDocument>,
    @InjectModel(EduContents.name) private educontentsModel: Model<EduContentsDocument>,
  ) {}

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

    cursor.forEach(element => {
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
    });

    let levelContents = await this.educontentsModel.find({
      level: dto.selectedLevel
    })

    levelContents.forEach(element => {
      if (element.contentsSerialNum.includes('a' || 'A')) {
        dto.articleTotal += 1;
      }
      if (element.contentsSerialNum.includes('s' || 'S')) {
        dto.seriesTotal += 1;
      }
    })

    return dto
  }

  async existEdustatus(user_id: string): Promise<boolean> {
    const edustatus = await this.edustatusModel.findOne({
      userId: new Types.ObjectId(user_id),
    });
    if (!edustatus) {
        return false
    }
      return true
  }

  async updateUserCompleted(user_id: string, body: UpdateEduCompleted) {
    const content = await this.educontentsModel.findOne({
      _id: new Types.ObjectId(body.contentId),
    });

    await this.createReadStory(user_id, body)

    // // static read update
    // var count = 0
    // Object.keys(status.levelProgress).forEach((content, _) => {
    //   count += (status.levelProgress[content].seriesComplete + status.levelProgress[content].articleComplete);
    // });

    // let updatedLevel = +status.selectedLevel + 1;
    // if (updatedLevel > 10) {
    //   updatedLevel = 10;
    // }

    // const result = await this.edustatusModel.findOneAndUpdate({userId: user_id}, { 
    //   $set: {
    //     selectedLevel: updatedLevel,
    //     updatedAt: now()}
    // });

    return 'result';
  }

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


    return result; 
  }

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

  async createReadStory(user_id: string, body: UpdateEduCompleted) {
    const readstory = await this.readstoryModel.findOne({
      userId: new Types.ObjectId(user_id),
      contentsSerialNum: body.contentsSerialNum
    });

    if (readstory) {
      throw new  NotAcceptableException("Already in readstories Document.")
    } else {}

    var story_result: ReadStory = new ReadStory()
    story_result = {
      userId: new Types.ObjectId(user_id),
      level: body.level,
      eduContentsId: new Types.ObjectId(body.contentId),
      contentsSerialNum: body.contentsSerialNum,
      lastReadAt: now(),
    }

    const result = await new this.readstoryModel(story_result).save();
    return result._id.toString();
  }

  async getReadStoriesCount(user_id, serial_num: string) {
    const readstory_count = await this.readstoryModel.find({
      userId: { $eq: user_id },
      contentsSerialNum: { $eq: serial_num}
    }).count();

    return readstory_count
  }

  async getReadStories(user_id: string) {
    const readstory = await this.readstoryModel.find({
      userId: { $eq: user_id },
    });

    return readstory
  }

  async createQuizResult(user_id, quiz_id: string, correct: boolean): Promise<string> {
    const quiz = await this.quizresultModel.find({
      userId: { $eq: user_id },
      quizId: { $eq: quiz_id },
    });

    if (!quiz) {
      throw new NotAcceptableException("Already in Document.");
    } else {}

    var quizresult: QuizResult = new QuizResult();
    quizresult = {
      userId: user_id,
      quizId: quiz_id,
      corrected: correct,
    }

    const result = await new this.quizresultModel(quizresult).save();
    return result._id.toString();
  }

  async getQuizCorrectRate(user_id: string) {
    const total_quiz_result = await this.quizresultModel.find({
      userId: { $eq: user_id },
    }).count();

    const correct_quiz_result = await this.quizresultModel.find({
      userId: { $eq: user_id },
      corrected: { $eq: true },
    }).count();

    const correct_rate = (correct_quiz_result/total_quiz_result)*100
    return correct_rate.toFixed(0)
  }

  async getMasteredVocabs(user_id: string) {
    const matered_quiz_result = await this.quizresultModel.find({
      userId: { $eq: user_id },
      corrected: { $eq: true },
    }).count();

    return matered_quiz_result
  }

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

      if (readContents.length == educontentsCount) {
        let dto = new CertificateDetailDto()
        dto.level = level;
        dto.completedAt = readContents[0].completedAt;
        dto.completion = true;
        return dto
      } else {
        throw new NotAcceptableException('Not completed Level')
      }
  }

  async getStudiedDates(user_id: string, query: GetReadStoryDto) {
    const start_date = new Date(query.start).toString()
    const end_date = new Date(query.end).toString()

    const studied = await this.readstoryModel.find({
      "updatedAt": {
        $gte: new Date(start_date),
        $lte: new Date(end_date)
      }
    });

    return studied
  }

  async updateRecentContent(level, serial_number: string){
    // if (serial_number.includes('S') || serial_number.includes('s')) {
    //   var seriesNum = +serial_number.substr(3, 3)
    //   var storyIndex = +serial_number.slice(-4)

    //   if (recSeries.seriesTotal == storyIndex) {
    //     const serieses = await this.educontentsModel.find({
    //       level: { $eq: level },
    //       seriesNum: { $eq: seriesNum + 1 },
    //     });

    //     if (serieses.length != 0) {
    //       const seriesTemp = serieses.sort((a, b) => a.seriesNum > b.seriesNum ? -1 : 1);
    //       const sortedSeries = seriesTemp.sort((a, b) => a.storyIndex > b.storyIndex ? -1 : 1);

    //       const series_sorted_len = sortedSeries.length;
      
    //       var series_count = 0;
    //       sortedSeries.forEach((content, _) => {
    //         if (content.seriesNum == sortedSeries[series_sorted_len-1].seriesNum) {
    //           series_count += 1;
    //         }
    //       });

    //       recSeries.contentsId = sortedSeries[series_sorted_len -1]._id.toString();
    //       recSeries.contentsSerialNum = sortedSeries[series_sorted_len-1].contentsSerialNum;
    //       recSeries.seriesTotal = series_count;
    //       recSeries.title = sortedSeries[series_sorted_len-1].title;
    //     }
    //   } else {
    //     const series = await this.educontentsModel.findOne({
    //       level: { $eq: level },
    //       seriesNum: { $eq: seriesNum },
    //       storyIndex: { $eq: storyIndex+1 },
    //     });
        
    //     if (series) {
    //       recSeries.contentsId = series._id.toString();
    //       recSeries.contentsSerialNum = series.contentsSerialNum;
    //       recSeries.title = series.title;
    //     }
    //   }
    // }

    // if (serial_number.includes('A') || serial_number.includes('a')) {
    //   var storyIndex = +serial_number.slice(-6)

    //   const article = await this.educontentsModel.findOne({
    //     level: { $eq: level },
    //     seriesNum: { $eq: 0 },
    //     storyIndex: { $eq: storyIndex+1 },
    //   });

    //   if (article) {
    //     recArticle.contentsId = article._id.toString();
    //     recArticle.contentsSerialNum = article.contentsSerialNum;
    //     recArticle.title = article.title;
    //   }
    // }

    // return [recSeries, recArticle]
  }

  _edustatusToDto(doc: EduStatus | EduStatusDocument): EduStatusDto {
    const dto = new EduStatusDto();
    dto.id = doc._id.toHexString();
    dto.userId = doc.userId.toHexString();

    return dto
  }
}