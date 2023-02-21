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
import { AudioPlayer, AudioPlayerDocument } from './schemas/audioplayer.schema';
import { EduStatus, EduStatusDocument } from '../edustatus/schemas/edustatus.schema';
import { Bookmark, BookmarkDocument } from '../educontents/schemas/bookmark.schema';
import { EduContents, EduContentsDocument } from '../educontents/schemas/educontents.schema';
import { UtilsService } from 'src/common/providers';

@Injectable()
export class AudioplayerService {
    constructor(
        private utilsService: UtilsService,
        @InjectModel(AudioPlayer.name) private audioplayerModel: Model<AudioPlayerDocument>,
        @InjectModel(EduContents.name) private educontentsModel: Model<EduContentsDocument>,
        @InjectModel(Bookmark.name) private bookmarkModel: Model<BookmarkDocument>,
        @InjectModel(EduStatus.name) private edustatusModel: Model<EduStatusDocument>
      ) {}

    async GetAudioPlayerBySerialNum(contents_serial_num: string): Promise<AudioPlayerDto> {
        const educontents = await this.educontentsModel.find({
            contentsSerialNum: { $eq: contents_serial_num }
        });

        var audioplayer: AudioPlayerDto = new AudioPlayerDto();
        audioplayer = {
            contentsSerialNum: educontents[0].contentsSerialNum,
            level: educontents[0].level,
            title: educontents[0].title,
            content: educontents[0].content,
            audioFilePath: educontents[0].audioFilePath
        }
        return audioplayer;
    }
    
    // async createFaq(body: AudioPlayerDto): Promise<string> {
    //     var faqboard: AudioPlayer = new AudioPlayer();
    //     faqboard = {
    //         category: body.category,
    //         question: body.question,
    //         answer: body.answer
    //     }
    //     const result = await new this.audioplayerModel(faqboard).save();
    //     return result._id.toString(); 
    // }

    async existBycontentsSerialNum(contents_serial_num: string): Promise<boolean> {
        const educontents = await this.educontentsModel.find({
            contentsSerialNum: { $eq: contents_serial_num }
        });
        if (!educontents) {
            return false;
        }
        return true;
    }

    // async updateFaq(audioplayer_id: string, body: UpdateAudioPlayerDto): Promise<string> {
    //     const result = await this.audioplayerModel.findByIdAndUpdate(audioplayer_id, { 
    //         $set: {
    //         category: body.category,
    //         question: body.question,
    //         answer: body.answer,
    //         updatedAt: now()}
    //     });

    //     return result._id.toString();
    // }

    // async deleteFaq(audioplayer_id: string): Promise<string> {
    //     await this.audioplayerModel.findByIdAndDelete(audioplayer_id);
    //     return audioplayer_id
    // }

    async getPagingAudioPlayers(
    query: GetListAudioPlayerDto,
    user_id: string,
    ): Promise<PagingResDto<AudioPlayerDto> | Buffer> {
        var filter: FilterQuery<AudioPlayerDocument> = {}

        // 북마크 or Not
        if (query.bookmarked) {
            const bookmarked = await this.bookmarkModel.find({
                userId: { $eq: user_id }
            });
            console.log(bookmarked)
        } else {

        }

        if (query.filterType == "ARTICLE") {
            
        } else if (query.filterType == "SERIES") {

        } else {

        }

        // 레벨별 진행률

        const lookups: PipelineStage[] = [
            {
              $lookup: {
                from: 'educontents',
                localField: 'contentsSerialNum',
                foreignField: 'contentsSerialNum',
                as: 'educontents',
              },
            },
            {
              $unwind: {
                path: '$educontents',
                preserveNullAndEmptyArrays: false,
              },
            },
        ];

        const projection: ProjectionFields<AudioPlayerDto> = {
            _id: 1,
            category: 1,
            question: 1,
            answer: 1,
            createdAt: 1,
        };

        const cursor = await this.audioplayerModel.aggregate([
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
