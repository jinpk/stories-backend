import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { EduContents, EduContentsDocument, Quizs, QuizsDocument } from './schemas/educontents.schema';
import { Vocab, VocabDocument } from '../vocabs/schemas/vocab.schema';
import { AwsService } from '../aws/aws.service'

@Injectable()
export class EducontentsService {
  constructor(
      @InjectModel(EduContents.name) private educontentsModel: Model<EduContentsDocument>,
      @InjectModel(Quizs.name) private quizsModel: Model<QuizsDocument>,
      @InjectModel(Vocab.name) private vocabModel: Model<VocabDocument>,
      private awsService: AwsService,
    ) {}
  
  async GetEducontents(educontents_id: string): Promise<EduContentsDocument | false> {
    const educontents = await this.educontentsModel.findById(educontents_id);
    if (!educontents) {
      return false;
    }
    return educontents;
  }

  async findById(id: string): Promise<EduContentsDocument | false> {
    const educontent = await this.educontentsModel.findById(id);
    if (!educontent) {
      return false;
    }
    return educontent;
  }

  async createContentsList(path: string, bucket: string): Promise<number>{
    var total = 0;
    var datas = [];
    const filelist = await this.awsService.filesListFromBucket(path, bucket);
    for (const file of filelist) {
      const exceldata = await this.awsService.fileFromBucket(file, bucket);
      datas.push(exceldata)
    }    
    await this.create(datas)
    return datas.length;
  }

  async create(exceldata: any[]) {
    for (const data of exceldata) {
      console.log(data.get('contents').get('2-퀴즈'))
      const serial_number = data.get('contents').get('0-스토리')[0].serialNum;
      const educontent: EduContents = {
        contentsSerialNum: serial_number,
        level:       data.get('contents').get('0-스토리')[0].level,
        title:       data.get('contents').get('0-스토리')[0].title,
        imagePath:       data.get('contents').get('0-스토리')[0].imagePath,
        audioFilePath:       data.get('contents').get('0-스토리')[0].audioFilePath,
        vocabCount: 0,
        questionCount: 0,
        timeLine: data.get('contents').get('1-타임라인'),
      };

      for (const quiz of data.get('contents').get('2-퀴즈')) {
        const quizs: Quizs = {
          contentsSerialNum: serial_number,
          quizType: quiz.type,
          question: quiz.question,
          passage: quiz.passage,
          answer: quiz.answer,
          options: [],
        }
        // option 이 포함된 key의 value를 array에 초기화
        data.get('contents').get('2-퀴즈').forEach((value, index) => {
          console.log(value, index)
        });
      }

      // await new this.educontentsModel(educontent).save();
    }
  }
}
