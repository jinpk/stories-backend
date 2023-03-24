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
import { EduStatusDto, Statics, Completed,
  LevelProgressDetail, LevelProgress, CertificateDto,
  RecentArticle, RecentSeries } from './dto/edustatus.dto';
import { GetReadStoryDto } from './dto/get-readstory.dto';
import { UpdateEduStatusDto, UpdateEduCompleted } from './dto/update-edustatus.dto';
import { LevelTestResultDto } from 'src/leveltest/dto/leveltest.dto';

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

  async updateUserCompleted(user_id: string, body: UpdateEduCompleted): Promise<string> {
    var status = await this.edustatusModel.findOne({ userId: user_id });

    var contentId: string = ""
    if (body.articleCompleted.length != 0) {
      contentId = body.articleCompleted[0]
      if (!status.levelCompleted[body.level].articleCompleted.includes(contentId)) {
        const articleArr = status.levelCompleted[body.level].articleCompleted.concat(body.articleCompleted);
        status.levelCompleted[body.level].articleCompleted = articleArr;
      }
      // level progress articleCompleted update
      status.levelProgress[body.level].articleComplete = status.levelCompleted[body.level].articleCompleted.length;
      status.levelProgress[body.level].updatedAt = now();
    }

    if (body.seriesCompleted.length != 0) {
      contentId = body.seriesCompleted[0]
      if (!status.levelCompleted[body.level].seriesCompleted.includes(contentId)) {
        const seriesArr = status.levelCompleted[body.level].seriesCompleted.concat(body.seriesCompleted);
        status.levelCompleted[body.level].seriesCompleted = seriesArr;
      }
      // level progress seriesCompleted update
      status.levelProgress[body.level].seriesComplete = status.levelCompleted[body.level].seriesCompleted.length;
      status.levelProgress[body.level].updatedAt = now();
    }

    const content = await this.educontentsModel.findOne({
      _id: new Types.ObjectId(contentId),
    });

    await this.createReadStory(user_id, content.contentsSerialNum, contentId)

    const [recSeries, recArticle] = await this.updateRecentContent(status.currentLevel.level, content.contentsSerialNum, status.recentSeries, status.recentArticle);

    // currenLevel completed update
    status.currentLevel.completed = status.levelProgress[body.level].articleComplete + status.levelProgress[body.level].seriesComplete;

    // static read update
    var count = 0
    Object.keys(status.levelProgress).forEach((content, _) => {
      count += (status.levelProgress[content].seriesComplete + status.levelProgress[content].articleComplete);
    });

    status.statics.read = count;

    const result = await this.edustatusModel.findOneAndUpdate({userId: user_id}, { 
      $set: {
        currentLevel: status.currentLevel,
        levelProgress: status.levelProgress,
        recentSeries: recSeries,
        recentArticle: recArticle,
        statics: status.statics,
        levelCompleted: status.levelCompleted,
        updatedAt: now()}
    });

    return result._id.toString();
  }

  async updateUserEduStatic(user_id: string, body: Statics): Promise<string> {
    const result = await this.edustatusModel.findOneAndUpdate({userId: user_id}, { 
      $set: {static: body, updatedAt: now()}
    });

    return result._id.toString();
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

  async createEduStatus(user_id: string, body: LevelTestResultDto): Promise<string> {
    var calculatedLevel = '1'

    if (!(await this.existEdustatus(user_id))) {
    }else{}

    calculatedLevel = await this.calculateLevel(body.step, body.correct)

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
      seriesComplete: 0,
      seriesTotal: series_count,
      articleComplete: 0,
      quizResult: {correct: 0, total: 0},
      updatedAt: now(),
    }

    var lvl_progress = {}
    lvl_progress[calculatedLevel] = cur_progress

    var cur_completed: Completed = new Completed();
    cur_completed = {
      articleCompleted: [],
      seriesCompleted: []
    }

    var lvl_completed = {}
    lvl_completed[calculatedLevel] = cur_completed

    const [reSeries, reArticle] = await this.genRecentContents(calculatedLevel)
    
    var edustatus: EduStatus = new EduStatus();
    edustatus = {
      firstLevel: calculatedLevel,
      levelProgress: lvl_progress,
      currentLevel: {level: calculatedLevel, total:article_count + series_count, completed:0},
      statics: {total: 0, read: 0, correctRate:0, words:0},
      recentArticle: reArticle,
      recentSeries: reSeries,
      levelCompleted: lvl_completed,
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

    const calculatedLevel = await this.calculateLevel(body.step, body.correct)

    var user_status = await this.edustatusModel.findOne({ userId: user_id });

    const curLevel: number = +user_status.currentLevel.level;
    const upgrade_level = (curLevel + 1).toString()

    const article_count = await this.educontentsModel.find({
      level: { $eq: upgrade_level },
      contentsSerialNum: { $regex: 'A', $options: 'i' },
    }).count();

    const series_count = await this.educontentsModel.find({
      level: { $eq: upgrade_level },
      contentsSerialNum: { $regex: 'S', $options: 'i' },
    }).count();

    // 현재 레벨 테스트 결과 저장
    user_status.levelProgress[calculatedLevel].quizResult.correct = body.correct
    user_status.levelProgress[calculatedLevel].quizResult.total = body.total

    // if 레벨 통과인 경우
    if ((body.correct/body.total)*100 > 1) {
      // recentcontent 다음 레벨 첫 컨텐츠로 설정
      const [reSeries, reArticle] = await this.genRecentContents(upgrade_level)
      user_status.recentSeries = reSeries;
      user_status.recentArticle = reArticle;

      // 다음 lvl progress 생성
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

      // 다음 level completed 생성
      var completed: Completed = new Completed();
      completed = {
        articleCompleted: [],
        seriesCompleted: []
      }
      user_status.levelCompleted[upgrade_level] = completed;
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
        levelCompleted: user_status.levelCompleted,
        recentSeries: user_status.recentSeries,
        recentArticle: user_status.recentArticle,
        updatedAt: now()
      }
    });

    return result._id.toString(); 
  }

  async createReadStory(user_id, serial_num, contents_id: string) {
    const readstory = await this.readstoryModel.findOne({
      userId: { $eq: user_id },
      contentsSerialNum: { $eq: serial_num}
    });

    if (readstory) {
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

  async updateRecentContent(level, serial_number: string, recent_series: RecentSeries, recent_article: RecentArticle){
    var recSeries: RecentSeries = new RecentSeries();
    var recArticle: RecentArticle = new RecentArticle();

    recSeries = recent_series
    recArticle = recent_article

    if (serial_number.includes('S') || serial_number.includes('s')) {
      var seriesNum = +serial_number.substr(3, 3)
      var storyIndex = +serial_number.slice(-4)

      if (recSeries.seriesTotal == storyIndex) {
        const serieses = await this.educontentsModel.find({
          level: { $eq: level },
          seriesNum: { $eq: seriesNum + 1 },
        });

        if (serieses.length != 0) {
          const seriesTemp = serieses.sort((a, b) => a.seriesNum > b.seriesNum ? -1 : 1);
          const sortedSeries = seriesTemp.sort((a, b) => a.storyIndex > b.storyIndex ? -1 : 1);

          const series_sorted_len = sortedSeries.length;
      
          var series_count = 0;
          sortedSeries.forEach((content, _) => {
            if (content.seriesNum == sortedSeries[series_sorted_len-1].seriesNum) {
              series_count += 1;
            }
          });

          recSeries.contentsId = sortedSeries[series_sorted_len -1]._id.toString();
          recSeries.contentsSerialNum = sortedSeries[series_sorted_len-1].contentsSerialNum;
          recSeries.seriesTotal = series_count;
          recSeries.title = sortedSeries[series_sorted_len-1].title;
        }
      } else {
        const series = await this.educontentsModel.findOne({
          level: { $eq: level },
          seriesNum: { $eq: seriesNum },
          storyIndex: { $eq: storyIndex+1 },
        });
        
        if (series) {
          recSeries.contentsId = series._id.toString();
          recSeries.contentsSerialNum = series.contentsSerialNum;
          recSeries.title = series.title;
        }
      }
    }

    if (serial_number.includes('A') || serial_number.includes('a')) {
      var storyIndex = +serial_number.slice(-6)

      const article = await this.educontentsModel.findOne({
        level: { $eq: level },
        seriesNum: { $eq: 0 },
        storyIndex: { $eq: storyIndex+1 },
      });

      if (article) {
        recArticle.contentsId = article._id.toString();
        recArticle.contentsSerialNum = article.contentsSerialNum;
        recArticle.title = article.title;
      }
    }

    return [recSeries, recArticle]
  }

  async genRecentContents(level: string): Promise<[RecentSeries, RecentArticle]> {
    var recSeries: RecentSeries = new RecentSeries();
    var recArticle: RecentArticle = new RecentArticle();

    recSeries = {contentsId:'',contentsSerialNum:'', seriesTotal: 0, title:''}
    recArticle = {contentsId:'',contentsSerialNum:'',title:''}

    const articles = await this.educontentsModel.find({
      level: { $eq: level },
      contentsSerialNum: { $regex: 'A', $options: 'i' },
    });

    const serieses = await this.educontentsModel.find({
      level: { $eq: level },
      contentsSerialNum: { $regex: 'S', $options: 'i' },
    });

    const sortedArticle = articles.sort((a, b) => a.storyIndex > b.storyIndex ? -1 : 1);
    const seriesTemp = serieses.sort((a, b) => a.seriesNum > b.seriesNum ? -1 : 1);
    const sortedSeries = seriesTemp.sort((a, b) => a.storyIndex > b.storyIndex ? -1 : 1);

    const series_sorted_len = sortedSeries.length
    const article_sorted_len = sortedArticle.length

    var series_count = 0;
    sortedSeries.forEach((content, _) => {
      if (content.seriesNum == sortedSeries[series_sorted_len-1].seriesNum) {
        series_count += 1;
      }
    });

    if (serieses.length != 0) {
      recSeries.contentsId = sortedSeries[series_sorted_len -1]._id.toString();
      recSeries.contentsSerialNum = sortedSeries[series_sorted_len-1].contentsSerialNum;
      recSeries.seriesTotal = series_count;
      recSeries.title = sortedSeries[series_sorted_len-1].title;
    }

    if (articles.length != 0 ) {
      recArticle.contentsId = sortedArticle[article_sorted_len-1]._id.toString();
      recArticle.contentsSerialNum = sortedArticle[article_sorted_len-1].contentsSerialNum;
      recArticle.title = sortedArticle[article_sorted_len-1].title;
    }
    return [recSeries, recArticle]
  }
}
