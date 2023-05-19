/*
  학습 컨텐츠 서비스 함수
  - 학습컨텐츠(educontents) 등록/조회/관리
  - 벌크 업로드
  - 학습 퀴즈 조회/관리
*/

import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  now,
  FilterQuery,
  Model,
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
import {
  EduContentsDto,
  ContentsQuizDto,
  BookmarkDto,
} from './dto/educontents.dto';
import {
  UpdateEduContentsDto,
  UpdateQuizsDto,
} from './dto/update-educontents.dto';
import {
  GetListEduContentsDto,
  GetListQuizDto,
  GetListBookmarkDto,
} from './dto/get-educontents.dto';
import { AwsService } from '../aws/aws.service';
import { EXCEL_COLUMN_LIST } from './educontents.constant';
import { CommonExcelService, UtilsService } from 'src/common/providers';
import {
  Bulk,
  BulkDocument,
  BulkLog,
  BulkLogDocument,
} from './schemas/bulk.schema';
import { EduContentUploadState } from './enums';

@Injectable()
export class EducontentsService {
  constructor(
    private utilsService: UtilsService,
    private commonExcelService: CommonExcelService,
    @InjectModel(EduContents.name)
    private educontentsModel: Model<EduContentsDocument>,
    @InjectModel(Quizs.name) private quizsModel: Model<QuizsDocument>,
    @InjectModel(Vocab.name) private vocabModel: Model<VocabDocument>,
    @InjectModel(Bookmark.name) private bookmarkModel: Model<BookmarkDocument>,
    @InjectModel(Bulk.name) private bulkModel: Model<BulkDocument>,
    @InjectModel(BulkLog.name) private bulkLogModel: Model<BulkLogDocument>,
    private awsService: AwsService,
  ) {}

  /*
  * 학습 컨텐츠 조희
  * @query:
  *   id:                      string
  * @return:
  *   educontent:              EduContentsDocument
  */
  async GetEducontents(
    educontents_id: string,
  ): Promise<EduContentsDocument | false> {
    const educontents = await this.educontentsModel.findById(educontents_id);
    if (!educontents) {
      return false;
    }
    return educontents;
  }

  /*
  * 학습 컨텐츠 삭제
  * @params:
  *   id:                      string
  * @return:
  *   id:                      string
  */
  async deleteEduContents(id: string) {
    await this.educontentsModel.findByIdAndDelete(id);
    return id;
  }

  /*
  * 학습 컨텐츠 수정 by id
  * @params:
  *   id:                      string
  *   body:                    UpdateEduContentsDto
  * @return:
  */
  async updateEduContentsById(id: string, body: UpdateEduContentsDto) {
    await this.educontentsModel.findByIdAndUpdate(id, {
      $set: {
        contentsSerialNum: body.contentsSerialNum,
        level: body.level,
        title: body.title,
        content: body.content,
        seriesNum: body.seriesNum,
        storyIndex: body.storyIndex,
        imagePath: body.imagePath,
        audioFilePath: body.audioFilePath,
        timeLine: body.timeLine,
        updatedAt: now(),
      },
    });
  }

  /*
  * 학습 컨텐츠 유무 by id
  * @query:
  *   id:                      string
  * @return: 
  *   true || false            boolean
  */
  async existEduContentById(id: string): Promise<boolean> {
    const educontent = await this.educontentsModel.findById(id);
    if (!educontent) {
      return false;
    }
    return true;
  }

  /*
  * 학습 컨텐츠 by id
  * @query:
  *   id:             string
  * @return: 
  *   dto:            EduContentsDto
  */
  async getEduContentById(id: string): Promise<EduContentsDto> {
    const doc = await this.educontentsModel.findById(id);
    return this._docToEduContentsDto(doc);
  }

  /*
  * Bulk 개별 조회
  * @query:
  *   id:             string
  * @return: 
  *   educontents:    EduContentsDocument
  */
  async findById(id: string): Promise<EduContentsDocument | false> {
    const educontent = await this.educontentsModel.findById(id);
    if (!educontent) {
      return false;
    }
    return educontent;
  }

  /*
  * Bulk 개별 조회
  * @params bulkId ObjectId
  * @return: {
  *   _id: string,
  *   filesCount: number,
  *   createdAt: ISODate,
  *   logs: Array,
  *   updatedAt: ISODate,
  * }
  */
  async getBulk(bulkId: string): Promise<Bulk> {
    const doc = await this.bulkModel.aggregate([
      {
        $match: {
          _id: new Types.ObjectId(bulkId),
        },
      },
      {
        $lookup: {
          from: 'bulk_logs',
          localField: '_id',
          foreignField: 'bulkId',
          as: 'bulk_logs',
        },
      },
    ]);
    if (!doc) {
      throw new NotFoundException();
    }
    return doc[0];
  }

  /*
  * 가장 최근의 Bulk 업로드 날짜 조회
  * @params 
  * @return {
  *   recentDate: "YYYY-MM-DD"
  * }
  */
  async getRecentBulk(): Promise<Object> {
    const doc = await this.bulkModel.aggregate([
      {
        $sort: { completedAt: -1},
      },
      {
        $limit: 1,
      },
    ]);
    if (!doc) {
      throw new NotFoundException();
    }

    let res = {recentDate: ''}

    if (doc[0].completedAt != null) {
      let month = doc[0].completedAt.getMonth() + 1;
      let day = doc[0].completedAt.getDate();

      month = month >= 10 ? month : '0' + month;
      day = day >= 10 ? day : '0' + day;

      res = {recentDate: doc[0].completedAt.getFullYear() + '-' + month + '-' + day }
    } else {
      throw new Error('completeAt의 값이 null 입니다.');
    }

    return res;
  }

  /*
  * 컨첸츠 업로드
  * @params:
  *   path:               string
  * @return:
  *   id:                 string
  */
  async createContentsList(path: string): Promise<string> {
    const bucket: string = 'ttmikstories-data';
    if (!path.endsWith('/')) {
      path = path + '/';
    }

    const pathOne = await this.bulkModel.findOne({
      path,
    });
    if (pathOne && !pathOne.completeAt) {
      throw new ConflictException({
        message: '현재 처리중인 경로입니다.',
        description:
          '오류가 지속된다면 s3 내에서 폴더를 복사후 새로운 폴더로 진행해 주세요.',
        bulkId: pathOne._id.toHexString(),
      });
    }

    const allList = await this.awsService.filesListFromBucket(path, bucket);
    const filelist = allList.filter((x) => x !== path);
    if (!filelist.length) {
      throw new UnprocessableEntityException(
        '입력하신 경로에 xlsx 파일을 찾을 수 없습니다.',
      );
    }
    const doc = await new this.bulkModel({
      filesCount: filelist.length,
      path,
    }).save();

    this.asyncBulkUpload(doc._id, filelist);

    return doc._id.toHexString();
  }

  /*
  * 벌크 업로드
  * @params:
  *   bulkId:               GetListEduContentsDto
  *   excelPaths:           string[]
  * @return:
  */
  async asyncBulkUpload(bulkId: Types.ObjectId, excelPaths: string[]) {
    const bucket: string = 'ttmikstories-data';

    for await (const path of excelPaths) {
      const log = new BulkLog();
      log.bulkId = bulkId;
      log.key = path;
      log.state = EduContentUploadState.PENDING;

      try {
        const data = await this.awsService.fileFromBucket(path, bucket);
        await this.createWithExcelData(data);
        log.state = EduContentUploadState.SUCCEED;
      } catch (err: any) {
        const error =
          typeof err === 'string' ? err : err.message || JSON.stringify(err);
        log.error = error;
        log.state = EduContentUploadState.FAILED;
      }
      await new this.bulkLogModel(log).save();
    }

    await this.bulkModel.findByIdAndUpdate(bulkId, {
      $set: { completeAt: now() },
    });
  }

  /*
  * 벌크 업로드
  * @params:
  *   data:               GetListEduContentsDto
  * @return:
  */
  async createWithExcelData(data: any) {
    const serial_number = data.get('contents').get('0-스토리')[0].serialNum;

    if (
      await this.educontentsModel.findOne({ contentsSerialNum: serial_number })
    ) {
      throw new Error('이미 등록된 serialNumber 입니다.');
    }

    var seriesNum = 0;
    var storyIndex = 0;

    if (serial_number.includes('S') || serial_number.includes('s')) {
      var seriesNum = +serial_number.substr(3, 3);
      var storyIndex = +serial_number.slice(-4);
    }
    if (serial_number.includes('A') || serial_number.includes('a')) {
      var storyIndex = +serial_number.slice(-6);
    }

    // 컨텐츠, 타임라인
    const educontent: EduContents = {
      contentsSerialNum: serial_number,
      level: data.get('contents').get('0-스토리')[0].level,
      title: data.get('contents').get('0-스토리')[0].title,
      imagePath: data.get('contents').get('0-스토리')[0].imagePath,
      audioFilePath: data.get('contents').get('0-스토리')[0].audioFilePath,
      seriesNum: seriesNum,
      storyIndex: storyIndex,
      vocabCount: data.get('contents').get('3-단어').length,
      questionCount: data.get('contents').get('2-퀴즈').length,
      content: data.get('contents').get('0-스토리')[0].content,
      timeLine: data.get('contents').get('1-타임라인'),
    };
    // 퀴즈
    var quizs: Quizs = new Quizs();
    for (const quiz of data.get('contents').get('2-퀴즈')) {
      quizs = {
        contentsSerialNum: serial_number,
        quizType: quiz.type,
        question: quiz.question,
        passage: quiz.passage,
        answer: quiz.answer,
        options: [],
      };

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
    var vocabs: Vocab = new Vocab();
    for (const vocab of data.get('contents').get('3-단어')) {
      vocabs = {
        contentsSerialNum: serial_number,
        audioFilePath: vocab.audio_file_path,
        vocab: vocab.vocab,
        meaningEn: vocab.meaning_en,
        value: vocab.value,
        connSentence: vocab.conn_sentence,
        previewVocabulary: 'N',
      };
      Object.entries(vocab).forEach(([key, value]) => {
        if (key.includes('vocabulary')) {
          if (value != null) {
            if (value == 'Y') {
              vocabs.previewVocabulary = 'Y';
            } else {
              vocabs.previewVocabulary = 'N';
            }
          } else {
            vocabs.previewVocabulary = 'N';
          }
        }
      });
      await new this.vocabModel(vocabs).save();
    }
    await new this.educontentsModel(educontent).save();
  }

  /*
  * 학습 컨텐츠 목록 조회
  * @params:
  *   query:              GetListEduContentsDto
  * @return: {
  *   total: number,
  *   data: [
  *     {
  *       educontent      EduContentsDto
  *     },
  *   ]
  * }
  */
  async getPagingEduContents(
    query: GetListEduContentsDto,
  ): Promise<PagingResDto<EduContentsDto> | Buffer> {
    var filter: FilterQuery<EduContentsDocument> = {};
    if (query.level != undefined) {
      filter.level = { $eq: query.level };
    }
    if (query.title != undefined) {
      filter.title = { $regex: query.title, $options: 'i' };
    }
    if (query.contentType != undefined) {
      if (query.contentType == 'SERIES') {
        filter.contentsSerialNum = { $regex: 'S', $options: 'i' };
      }
      if (query.contentType == 'ARTICLE') {
        filter.contentsSerialNum = { $regex: 'A', $options: 'i' };
      }
    }
    if (query.contentsSerialNum != undefined) {
      filter.contentsSerialNum = {
        $regex: query.contentsSerialNum,
        $options: 'i',
      };
    }

    const projection: ProjectionFields<EduContentsDto> = {
      _id: 1,
      contentsSerialNum: 1,
      level: 1,
      title: 1,
      content: 1,
      seriesNum: 1,
      storyIndex: 1,
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

  /*
  * Schema to dto 변환
  * @params:
  *   doc:                EduContentsDocument
  * @return:
  *   content:            EduContentsDto
  */
  _docToEduContentsDto(doc: EduContentsDocument): EduContentsDto {
    const dto = new EduContentsDto();
    dto.id = doc._id.toString();
    dto.contentsSerialNum = doc.contentsSerialNum;
    dto.level = doc.level;
    dto.title = doc.title;
    dto.seriesNum = doc.seriesNum;
    dto.storyIndex = doc.storyIndex;
    dto.vocabCount = doc.vocabCount;
    dto.questionCount = doc.questionCount;
    dto.imagePath = doc.imagePath;
    dto.audioFilePath = doc.audioFilePath;
    dto.timeLine = doc.timeLine;
    dto.content = doc.content;

    return dto;
  }

  // Educontents Quiz Services
  /*
  * 퀴즈 삭제
  * @params:
  *   id:              string
  * @return:
  */
  async deleteQuizs(id: string) {
    await this.quizsModel.findByIdAndDelete(id);
    return id;
  }

  /*
  * 퀴즈 업데이트
  * @params:
  *   id:              string
  *   body:            UpdateQuizsDto
  * @return:
  */
  async updateQuizsById(id: string, body: UpdateQuizsDto) {
    await this.quizsModel.findByIdAndUpdate(id, {
      $set: {
        contentsSerialNum: body.contentsSerialNum,
        quizType: body.quizType,
        question: body.question,
        passage: body.passage,
        answer: body.answer,
        options: body.options,
        updatedAt: now(),
      },
    });
  }

  /*
  * 퀴즈 존재 유무 by Id
  * @query:
  *   id:              string
  * @return:
  *   true || false    boolean
  */
  async existQuizsById(id: string): Promise<boolean> {
    const quiz = await this.quizsModel.findById(id);
    if (!quiz) {
      return false;
    }
    return true;
  }

  /*
  * 퀴즈 생성
  * @params:
  *   body:                     ContentsQuizDto
  * @return:
  *   id                        string
  */
  async createQuiz(body: ContentsQuizDto): Promise<string> {
    var quiz: Quizs = new Quizs();
    quiz = {
      contentsSerialNum: body.contentsSerialNum,
      quizType: body.quizType,
      question: body.question,
      passage: body.passage,
      answer: body.answer,
      options: body.options,
    };
    const result = await new this.quizsModel(quiz).save();
    return result._id.toString();
  }
  
  /*
  * 퀴즈 목록 조회
  * @query:
  *   contentsSerialNum:              string
  *   query:                          GetListQuizDto
  * @return: {
  *   total: number,
  *   data: [
  *     {
  *       Quiz                        ContentsQuizDto
  *     },
  *   ]
  * }
  */
  async getPagingQuizs(
    contentsSerialNum: string,
    query: GetListQuizDto,
  ): Promise<PagingResDto<ContentsQuizDto> | Buffer> {
    const filter: FilterQuery<QuizsDocument> = {
      contentsSerialNum: { $eq: contentsSerialNum },
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

  /*
  * 사용자 북마크 등록을 위한 생성 함수
  * @params:
  *   user_id:              string
  *   educontents_id:       string
  * @return:
  *   educontents_id:       string
  */
  async createBookmark(user_id, educontents_id: string): Promise<string> {
    const bookmarked = await this.bookmarkModel.findOne({
      userId: { $eq: new Types.ObjectId(user_id) },
      eduContentsId: { $eq: educontents_id },
    });
    if (bookmarked) {
      throw new ForbiddenException('Already bookmarked.');
    }

    var bookmark: Bookmark = new Bookmark();
    bookmark = {
      userId: new Types.ObjectId(user_id),
      eduContentsId: educontents_id,
    };

    const result = await new this.bookmarkModel(bookmark).save();
    return result._id.toString();
  }

  /*
  * 사용자 북마크 삭제 위한 생성 함수
  * @params:
  *   user_id:           string
  *   bookmark_id:       string
  * @return:
  *   bookmark_id:       string
  */
  async deleteBookmark(user_id, bookmark_id: string): Promise<string> {
    const result = await this.bookmarkModel.findByIdAndDelete({
      _id: new Types.ObjectId(bookmark_id),
      userId: user_id,
    });

    if (!result) {
      throw new NotFoundException('일치하는 bookmark_id가 없습니다.');
    }

    return bookmark_id;
  }

  /*
  * 사용자 북마크 리스트 조회
  * @query:
  *   email:              string
  *   query:              GetListBookmarkDto
  * @return: {
  *   total: number,
  *   data: [
  *     {
  *       bookmark        BookmarkDto
  *     },
  *   ]
  * }
  */
  async getPagingBookmark(
    user_id,
    query: GetListBookmarkDto,
  ): Promise<PagingResDto<BookmarkDto> | Buffer> {
    const filter: FilterQuery<BookmarkDocument> = {
      userId: { $eq: user_id },
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
