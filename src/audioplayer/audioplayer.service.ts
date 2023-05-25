/*
  오디오플레이어 조회,제출,관리 서비스 함수
  -관리자 레벨테스트 등록/수정/삭제
  -사용자 레벨테스트 조회/제출
*/


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
import { AudioPlayerDto } from './dto/audioplayer.dto';
import { GetListAudioPlayerDto } from './dto/get-audioplayer.dto';
import { ReadStory, ReadStoryDocument } from '../edustatus/schemas/readstory.schema';
import { Bookmark, BookmarkDocument } from '../educontents/schemas/bookmark.schema';
import { EduContents, EduContentsDocument } from '../educontents/schemas/educontents.schema';
import { UtilsService } from 'src/common/providers';

@Injectable()
export class AudioplayerService {
    constructor(
        private utilsService: UtilsService,
        @InjectModel(EduContents.name) private educontentsModel: Model<EduContentsDocument>,
        @InjectModel(Bookmark.name) private bookmarkModel: Model<BookmarkDocument>,
        @InjectModel(ReadStory.name) private readstoryModel: Model<ReadStoryDocument>,
      ) {}

    /*
    * GET 오디오플레이어 By Serialnumber
    * @params:
    *   contents_serial_num: string    컨텐츠 시리얼 넘버
    *   body: {
    *     step: string                스텝
    *     lastStepCorrect: number     가장 스텝에서 맞춘 정답 갯수
    *   }
    * @return: {
    *   contentsId: string,
    *   contentsSerialNum: string,
    *   level: string,
    *   title: string,
    *   content: string,
    *   imagePath: string,            오디오플레이어 썸네일 이미지 경로
    *   audioFilePath: string,        오디오파일 경로 
    * }
    */
    async GetAudioPlayerBySerialNum(contents_serial_num: string): Promise<AudioPlayerDto> {
        const educontents = await this.educontentsModel.findOne({
            contentsSerialNum: { $eq: contents_serial_num }
        });

        var audioplayer: AudioPlayerDto = new AudioPlayerDto();

        audioplayer = {
          contentsId: educontents._id.toString(),
          contentsSerialNum: educontents.contentsSerialNum,
          level: educontents.level,
          title: educontents.title,
          content: educontents.content,
          imagePath: educontents.imagePath,
          audioFilePath: educontents.audioFilePath
        }
        return audioplayer;
    }
    
    /*
    * 오디오플레이어 유무 검증 By Serialnumber
    * @params:
    *   contents_serial_num: string    컨텐츠 시리얼 넘버
    * @return:               boolean
    */
    async existBycontentsSerialNum(contents_serial_num: string): Promise<boolean> {
        const educontents = await this.educontentsModel.find({
            contentsSerialNum: { $eq: contents_serial_num }
        });
        if (!educontents) {
            return false;
        }
        return true;
    }

    /*
    * 오디오플레이어 리스트 조회
    * @query:
    *   query:              getPagingAudioPlayers
    *   user_id:            string
    * @return: {
    *   total: number,
    *   data: [
    *     {
    *       AudioPlayerDto
    *     },
    *   ]
    * }
    */
    async getPagingAudioPlayers(
    query: GetListAudioPlayerDto,
    user_id: string,
    ): Promise<PagingResDto<AudioPlayerDto> | Buffer> {
      var bookmarked: any[] = [];
      var stories: any[] = [];

      var filter: FilterQuery<EduContentsDocument> = {}

      if (query.level == "0")  {
      } else {
        filter.level = query.level;
      }
      if (query.filterType == "ARTICLE") {
          filter.contentsSerialNum = { $regex: 'A', $options: 'i' };
      } else if (query.filterType == "SERIES") {
          filter.contentsSerialNum = { $regex: 'S', $options: 'i' };
      } else {}
      
      const projection: ProjectionFields<AudioPlayerDto> = {
          _id: 0,
          contentsId: '$_id',
          level: 1,
          title: 1,
          contentsSerialNum: 1,
          audioFilePath: 1,
          imagePath: 1,
      };

      let cursor = await this.educontentsModel.aggregate([
          { $match: filter },
          { $project: projection },
      ]);

      // 북마크 or Not
      if (query.bookmarked.toString() == "true") {
        var bookmarks = await this.bookmarkModel.find({
            userId: { $eq: new Types.ObjectId(user_id) }
        });
        if (bookmarks.length != 0) {
          bookmarks.forEach((content, _) => {
            bookmarked.push(content.eduContentsId.toString())
          })
        }
        cursor = cursor
          .filter((content) => bookmarked.includes(content.contentsId.toString()))
      } else {}

      if (query.filterType == "COMPLETE") {
        const readstory = await this.readstoryModel.find({
            userId: { $eq: user_id }
        });
  
        if (readstory.length != 0) {
          readstory.forEach((content, _) => {
            stories.push(content.contentsSerialNum)
          })
        }
        cursor = cursor
          .filter((content) => stories.includes(content.contentsSerialNum))
      }
      const metdata = cursor.length;
      const data = cursor;

      return {
      total: metdata || 0,
      data: data,
      }
    }
}
