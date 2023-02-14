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
import { EduContentsDto, UploadContentsDto } from './dto/educontents.dto';
import { GetListEduContentsDto } from './dto/get-educontents.dto';
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

  async existEduContentById(id: string): Promise<boolean> {
    const educontent = await this.educontentsModel.findById(id);
    console.log(educontent)
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

  async createContentsList(path: string, bucket: string): Promise<UploadContentsDto> {
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
}
