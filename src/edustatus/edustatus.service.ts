import { Injectable, Body } from '@nestjs/common';
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
import { EduStatusDto, Statics, Completed, LevelTestResultDto, LevelProgressDetail, LevelProgress, CertificateDto } from './dto/edustatus.dto';
import { GetReadStoryDto } from './dto/get-readstory.dto';
import { UpdateEduStatusDto } from './dto/update-edustatus.dto';

@Injectable()
export class EdustatusService {
  constructor(
    @InjectModel(EduStatus.name) private edustatusModel: Model<EduStatusDocument>,
    @InjectModel(QuizResult.name) private quizresultModel: Model<QuizResultDocument>,
    @InjectModel(ReadStory.name) private readstoryModel: Model<ReadStoryDocument>,
    @InjectModel(EduContents.name) private educontentsModel: Model<EduContentsDocument>,
  ) {}

  async getEduStatusById(user_id: string): Promise<EduStatusDto> {
    var edustatus =  await this.edustatusModel.findOne({ userId: user_id});
    return edustatus
  }

  async existEdustatus(user_id: string): Promise<boolean> {
    const edustatus = await this.edustatusModel.findOne({ userId: user_id});
    if (!edustatus) {
        return false
    }
      return true
  }

  async updateUserHighestLevel(user_id: string, level: string): Promise<string> {
    const result = await this.edustatusModel.findOneAndUpdate({userId: user_id}, { 
      $set: {highestLevel: level, updatedAt: now()}
    });
    return result._id.toString();
  }

  async updateUserEduLevel(user_id: string, body: Completed): Promise<string> {
    const status = await this.edustatusModel.findOne({ userId: user_id });

    const result = await this.edustatusModel.findOneAndUpdate({userId: user_id}, { 
      $set: {levelCompleted: body, updatedAt: now()}
    });

    this.createReadStory(user_id, "", "")

    return result._id.toString();
  }

  async updateUserEduStatic(user_id: string, body: Statics): Promise<string> {
    const result = await this.edustatusModel.findOneAndUpdate({userId: user_id}, { 
      $set: {static: body, updatedAt: now()}
    });

    return result._id.toString();
    }

  async createEduStatus(user_id: string, body: LevelTestResultDto): Promise<string> {
    if (!(await this.existEdustatus(user_id))) {

    }else{}

    const article_count = await this.educontentsModel.find({
      level: { $eq: body.level },
      contentsSerialNum: { $regex: 'a' || 'A' },
    }).count();

    const series_count = await this.educontentsModel.find({
      level: { $eq: body.level },
      contentsSerialNum: { $regex: 's' || 'S' },
    }).count();

    var cur_progress: LevelProgressDetail = new LevelProgressDetail();
    cur_progress = {
      articleTotal: article_count,
      seriesComplete: 0,
      seriesTotal: series_count,
      articleComplete: 0,
      quizResult: {correct: 0, total: 0},
      updatedAt: now(),
    }

    var lvl_progress = {}
    lvl_progress[body.level] = cur_progress

    var cur_completed: Completed = new Completed();
    cur_completed = {
      articleCompleted: [],
      seriesCompleted: []
    }

    var lvl_completed = {}
    lvl_completed[body.level] = cur_completed
    
    var edustatus: EduStatus = new EduStatus();
    edustatus = {
      firstLevel: body.level,
      levelProgress: lvl_progress,
      currentLevel: {level: body.level, total:article_count + series_count, completed:0},
      levelCompleted: lvl_completed,
      statics: {total: 0, read: 0, correctRate:0, words:0},
      recentArticle: {contentsId:'',contentsSerialNum:'',title:''},
      recentSeries: {contentsId:'',contentsSerialNum:'',title:''},
      userId: user_id,
    }

    const result = await new this.edustatusModel(edustatus).save();
    return result._id.toString(); 
  }

  async updateEduStatus(user_id: string, body: LevelTestResultDto): Promise<string> {
    if (await this.existEdustatus(user_id)) {
    }else{
      return await this.createEduStatus(user_id, body);
    }

    var user_status = await this.edustatusModel.findOne({ userId: user_id });

    const comLevel: number = +user_status.currentLevel.level;
    const upgrade_level = (comLevel + 1).toString()

    const article_count = await this.educontentsModel.find({
      level: { $eq: body.level },
      contentsSerialNum: { $regex: 'a' || 'A' },
    }).count();

    const series_count = await this.educontentsModel.find({
      level: { $eq: body.level },
      contentsSerialNum: { $regex: 's' || 'S' },
    }).count();

    if (user_status.levelProgress[body.level]) {
      user_status.levelProgress[body.level].quizResult.correct = body.correct
      user_status.levelProgress[body.level].quizResult.total = body.total
    } else {
      var progress: LevelProgressDetail = new LevelProgressDetail();
      progress = {
        articleTotal: article_count,
        seriesComplete: article_count,
        seriesTotal: series_count,
        articleComplete: series_count,
        quizResult: {correct: 0, total: 0},
        updatedAt: now(),
      }
      user_status.levelProgress[upgrade_level] = progress;
    }

    var lvl_progress: LevelProgress = user_status.levelProgress

    var total_count = 0
    var correct_count = 0
    Object.keys(lvl_progress).forEach((content, _) => {
      total_count += lvl_progress[content].quizResult.total
      correct_count += lvl_progress[content].quizResult.correct
    })

    const statics: Statics = user_status.statics
    statics.correctRate = (correct_count/total_count) * 100.0

    const result = await this.edustatusModel.findOneAndUpdate({userId: user_id}, { 
      $set: {
        currentLevel: {level: upgrade_level, total:article_count + series_count, completed:0},
        levelProgress: user_status.levelProgress,
        statics: statics,
        updatedAt: now()
      }
    });
    return result._id.toString(); 
  }

  async createReadStory(user_id, serial_num, contents_id: string) {
    const readstory = await this.readstoryModel.find({
      userId: { $eq: user_id },
      contentsSerialNum: { $eq: serial_num}
    });

    if (!readstory) {
      return "Already in Document."
    } else {}

    var story_result: ReadStory = new ReadStory()
    story_result = {
      userId: user_id,
      contentsSerialNum: serial_num,
      eduContentsId: contents_id,
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
      return "Already in Document."
    } else {}

    var quizresult: QuizResult = new QuizResult()
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
    const status = await this.edustatusModel.findOne({ userId: user_id });

    var lvl_progress: LevelProgress = status.levelProgress
    var certificates: CertificateDto[] = []

    Object.keys(lvl_progress).forEach((content, _) => {
      if ((lvl_progress[content].articleTotal == 0) && (lvl_progress[content].seriesTotal == 0)) {
      }else{
        if ((lvl_progress[content].articleTotal == lvl_progress[content].articleComplete) && 
        (lvl_progress[content].seriesTotal == lvl_progress[content].seriesComplete)) {
          certificates.push({'level': content, completion: true})
        }
      }
    });

    return certificates
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
}
