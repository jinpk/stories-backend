import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  EduContents,
  EduContentsDocument,
  Quizs,
  QuizsDocument,
} from './schemas/educontents.schema';
import { Vocab, VocabDocument } from '../vocabs/schemas/vocab.schema';
import { EduContentsDto, UploadContentsDto } from './dto/educontents.dto';
import { AwsService } from '../aws/aws.service'

@Injectable()
export class EducontentsService {
  constructor(
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

  async findAll(): Promise<EduContents[]> {
    return this.educontentsModel.find().exec();
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
        vocabCount: 0,
        questionCount: 0,
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
