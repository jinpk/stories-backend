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
import {
  EduContents,
  EduContentsDocument,
  Quizs,
  QuizsDocument,
} from './schemas/educontents.schema';
import { PagingResDto } from 'src/common/dto/response.dto';
import { Vocab, VocabDocument } from '../vocabs/schemas/vocab.schema';
import { Bookmark, BookmarkDocument } from './schemas/bookmark.schema';
import { EduContentsDto, UploadContentsDto, ContentsQuizDto, BookmarkDto } from './dto/educontents.dto';
import { UpdateEduContentsDto, UpdateQuizsDto } from './dto/update-educontents.dto';
import { GetListEduContentsDto, GetListQuizDto, GetListBookmarkDto } from './dto/get-educontents.dto';
import { AwsService } from '../aws/aws.service';
import { EXCEL_COLUMN_LIST } from './educontents.constant';
import { CommonExcelService, UtilsService } from 'src/common/providers';

@Injectable()
export class EducontentsService {
  constructor(
    private utilsService: UtilsService,
    private commonExcelService: CommonExcelService,
    @InjectModel(EduContents.name) private educontentsModel: Model<EduContentsDocument>,
    @InjectModel(Quizs.name) private quizsModel: Model<QuizsDocument>,
    @InjectModel(Vocab.name) private vocabModel: Model<VocabDocument>,
    @InjectModel(Bookmark.name) private bookmarkModel: Model<BookmarkDocument>,
    private awsService: AwsService,
  ) {}

  async GetEducontents(
    educontents_id: string,
  ): Promise<EduContentsDocument | false> {
    const educontents = await this.educontentsModel.findById(educontents_id);
    if (!educontents) {
      return false;
    }
    return educontents;
  }

  async deleteEduContents(id: string) {
    await this.educontentsModel.findByIdAndDelete(id);
    return id
  }

  async updateEduContentsById(id: string, body: UpdateEduContentsDto) {
    await this.educontentsModel.findByIdAndUpdate(id, { 
      $set: {body, updatedAt: now()}
    });
  }

  async existEduContentById(id: string): Promise<boolean> {
    const educontent = await this.educontentsModel.findById(id);
    if (!educontent) {
      return false;
    }
    return true;
  }

  async getEduContentById(id: string): Promise<EduContentsDto> {
    const doc = await this.educontentsModel.findById(id);
    return this._docToEduContentsDto(doc);
  }

  async findById(id: string): Promise<EduContentsDocument | false> {
    const educontent = await this.educontentsModel.findById(id);
    if (!educontent) {
      return false;
    }
    return educontent;
  }

  async createContentsList(path: string): Promise<UploadContentsDto> {
    const bucket: string = 'ttmikstories-data';
    var total = 0;
    var datas = [];

    const filelist = await this.awsService.filesListFromBucket(path, bucket);
    for (const file of filelist) {
      const exceldata = await this.awsService.fileFromBucket(file, bucket);
      datas.push(exceldata)
    }    
    await this.create(datas)
    total = datas.length

    const dto = new UploadContentsDto();
    dto.total = total;

    return dto;
  }

  async create(exceldata: any[]) {
    for (const data of exceldata) {
      const serial_number = data.get('contents').get('0-스토리')[0].serialNum;

      // 컨텐츠, 타임라인
      const educontent: EduContents = {
        contentsSerialNum: serial_number,
        level: data.get('contents').get('0-스토리')[0].level,
        title: data.get('contents').get('0-스토리')[0].title,
        imagePath: data.get('contents').get('0-스토리')[0].imagePath,
        audioFilePath: data.get('contents').get('0-스토리')[0].audioFilePath,
        vocabCount: data.get('contents').get('3-단어').length,
        questionCount: data.get('contents').get('2-퀴즈').length,
        content: data.get('contents').get('0-스토리')[0].content,
        timeLine: data.get('contents').get('1-타임라인'),
      };
      // 퀴즈
      var quizs: Quizs = new Quizs()
      for (const quiz of data.get('contents').get('2-퀴즈')) {
        quizs = {
          contentsSerialNum: serial_number,
          quizType: quiz.type,
          question: quiz.question,
          passage: quiz.passage,
          answer: quiz.answer,
          options: [],
        }

        Object.entries(quiz).forEach(([key, value]) => {
          if (key.includes('option')) {
            if (value != null) {
              quizs.options.push(value.toString());
            }
          }
        });
        await new this.quizsModel(quizs).save();
      }

      // 단어
      var vocabs: Vocab = new Vocab()
      for (const vocab of data.get('contents').get('3-단어')) {
        vocabs = {
          contentsSerialNum: serial_number,
          audioFilePath: vocab.audio_file_path,
          vocab: vocab.vocab,
          meaningEn: vocab.meaning_en,
          value: vocab.value,
          connSentence: vocab.conn_sentence,
          previewVocabulary: 'N',
        }
        Object.entries(vocab).forEach(([key, value]) => {
          if (key.includes('vocabulary')) {
            if (value != null)  {
              if (value == 'Y') {
                vocabs.previewVocabulary = 'Y';
              } else {
                vocabs.previewVocabulary = 'N';
              }
            } else {
              vocabs.previewVocabulary = 'N'
            }
          }
        });
        await new this.vocabModel(vocabs).save();
      }
      await new this.educontentsModel(educontent).save();
    }
  }

  async getPagingEduContents(
    query: GetListEduContentsDto,
  ): Promise<PagingResDto<EduContentsDto> | Buffer> {
    var filter: FilterQuery<EduContentsDocument> = {}
    if (query.level != undefined) {
      filter.level = { $eq: query.level };
    }
    if (query.title != undefined) {
      filter.title = { $regex: query.title, $options: 'i' };
    }
    if (query.contentType != undefined) {
      if (query.contentType == 'SERIES'){
        filter.contentsSerialNum = { $regex: 'S', $options: 'i' };
      }
      if (query.contentType == 'ARTICLE'){
        filter.contentsSerialNum = { $regex: 'A', $options: 'i' };
      }
    }
    if (query.contentsSerialNum != undefined) {
      filter.contentsSerialNum = { $regex: query.contentsSerialNum, $options: 'i' };
    }

    const projection: ProjectionFields<EduContentsDto> = {
      _id: 1,
      contentsSerialNum: 1,
      level: 1,
      title: 1,
      content: 1,
      vocabCount: 1,
      questionCount: 1,
      imagePath: 1,
      audioFilePath: 1,
      timeLine: 1,
    };

    const cursor = await this.educontentsModel.aggregate([
      { $match: filter },
      { $project: projection },
      { $sort: { createdAt: -1 } },
      this.utilsService.getCommonMongooseFacet(query),
    ]);

    const metdata = cursor[0].metadata;
    const data = cursor[0].data;

    if (query.excel === '1') {
      return await this.commonExcelService.listToExcelBuffer(
        EXCEL_COLUMN_LIST,
        data,
      );
    }
    return {
      total: metdata[0]?.total || 0,
      data: data,
    };
  }

  _docToEduContentsDto(doc: EduContentsDocument): EduContentsDto {
    const dto = new EduContentsDto();
    dto.id = doc._id.toString();
    dto.contentsSerialNum = doc.contentsSerialNum;
    dto.level = doc.level;
    dto.title = doc.title;
    dto.vocabCount = doc.vocabCount;
    dto.questionCount = doc.questionCount;
    dto.imagePath = doc.imagePath;
    dto.audioFilePath = doc.audioFilePath;
    dto.timeLine = doc.timeLine;
    dto.content = doc.content;

    return dto;
  }

  // Educontents Quiz Services  
  async deleteQuizs(id: string) {
    await this.quizsModel.findByIdAndDelete(id);
    return id
  }

  async updateQuizsById(id: string, body: UpdateQuizsDto) {
    await this.quizsModel.findByIdAndUpdate(id, { 
      $set: {body, updatedAt: now()}
    });
  }

  async existQuizsById(id: string): Promise<boolean> {
    const quiz = await this.quizsModel.findById(id);
    if (!quiz) {
      return false;
    }
    return true;
  }

  async createQuiz(body: ContentsQuizDto): Promise<string> {
    var quiz: Quizs = new Quizs()
    quiz = {
      contentsSerialNum: body.contentsSerialNum,
      quizType: body.quizType,
      question: body.question,
      passage: body.passage,
      answer: body.answer,
      options: body.options,
    }
    const result = await new this.quizsModel(quiz).save();
    return result._id.toString();
  }

  async getPagingQuizs(
    contentsSerialNum: string, 
    query: GetListQuizDto,
  ): Promise<PagingResDto<ContentsQuizDto> | Buffer> {
    const filter: FilterQuery<VocabDocument> = {
      contentsSerialNum: { $eq: contentsSerialNum }
    };

    const projection: ProjectionFields<ContentsQuizDto> = {
      _id: 1,
      contentsSerialNum: 1,
      quizType: 1,
      question: 1,
      passage: 1,
      answer: 1,
      options: 1,
    };

    const cursor = await this.quizsModel.aggregate([
      { $match: filter },
      { $project: projection },
      { $sort: { createdAt: -1 } },
      this.utilsService.getCommonMongooseFacet(query),
    ]);

    const metdata = cursor[0].metadata;
    const data = cursor[0].data;

    return {
      total: metdata[0]?.total || 0,
      data: data,
    };
  }

  // EduContents Bookmark Services
  async createBookmark(user_id, educontents_id: string): Promise<string> {
    var bookmark: Bookmark = new Bookmark()
    bookmark = {
      userId: user_id,
      eduContentsId: educontents_id,
    }
    const result = await new this.bookmarkModel(bookmark).save();
    return result._id.toString();
  }

  async deleteBookmark(user_id, bookmark_id: string): Promise<string> {
    await this.bookmarkModel.findByIdAndDelete(
      {_id: new Types.ObjectId(bookmark_id), userId: user_id}
    );
    return bookmark_id
  }

  async getPagingBookmark(
    user_id, query: GetListBookmarkDto,
  ): Promise<PagingResDto<BookmarkDto> | Buffer> {
    const filter: FilterQuery<VocabDocument> = {
      userId: { $eq: user_id }
    };

    const projection: ProjectionFields<BookmarkDto> = {
      _id: 1,
      userId: 1,
      eduContentsId: 1,
    };

    const cursor = await this.bookmarkModel.aggregate([
      { $match: filter },
      { $project: projection },
      { $sort: { createdAt: -1 } },
      this.utilsService.getCommonMongooseFacet(query),
    ]);

    const metdata = cursor[0].metadata;
    const data = cursor[0].data;

    return {
      total: metdata[0]?.total || 0,
      data: data,
    };
  }
}
