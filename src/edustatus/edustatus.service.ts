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
import { QuizResult, QuizResultDocument } from './schemas/quizresult.schema';
import { ReadStory, ReadStoryDocument } from './schemas/readstory.schema';
import { EduStatusDto, Statics, LevelCompleted, LevelTestResultDto } from './dto/edustatus.dto';

@Injectable()
export class EdustatusService {
  constructor(
    @InjectModel(EduStatus.name) private edustatusModel: Model<EduStatusDocument>,
    @InjectModel(QuizResult.name) private quizresultModel: Model<QuizResultDocument>,
    @InjectModel(ReadStory.name) private readstoryModel: Model<ReadStoryDocument>,
  ) {}

  async getEduStatusById(user_id: string): Promise<EduStatusDto> {
    var edustatus =  await this.edustatusModel.findOne({user_id});
    return edustatus
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

  async updateUserEduLevel(user_id: string, body: LevelCompleted[]): Promise<string> {
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
      currentLevel: {level: body.level, total:0, completed:0},
      selectedLevel: body.level,
      levelCompleted: [],
      statics: {total: 0, read: 0, correctRate:0, words:0},
      recentArticle: {contentsId:'',contentsSerialNum:'',title:'', current:0, total: 0},
      recentSeries: {contentsId:'',contentsSerialNum:'',title:'', current:0, total:0},
      userId: user_id,
    }
    const result = await new this.edustatusModel(edustatus).save();
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
    }).count();

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

  async getUserCertificates(user_id: string): Promise<EduStatusDto> {
    return await this.edustatusModel.findOne({user_id});
  }

  async getStudiedDates(user_id, month: string) {
  }
}
