import { EdustatusService } from './../edustatus/edustatus.service';
/*
  단어 및 리뷰단어 조회,제출,관리 서비스 함수
  -관리자 단어 등록/수정/삭제
  -사용자 단어 조회/제출
  -사용자 리뷰단어 조회/제출
*/

import {
  Injectable,
  ForbiddenException
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  now,
  FilterQuery,
  Model,
  PipelineStage,
  ProjectionFields,
  Types,
} from 'mongoose';
import { PagingResDto, ReviewVocabPagingResDto } from 'src/common/dto/response.dto';
import { Vocab, VocabDocument } from './schemas/vocab.schema';
import { ReviewVocab, ReviewVocabDocument } from './schemas/review-vocab.schema';
import { VocabDto, ReviewVocabDto, ReviewVocabResultDto } from './dto/vocab.dto';
import { UpdateVocabDto } from './dto/update-vocab.dto';
import { GetVocabsDto, GetReviewVocabDto, GetCoreVocabDto } from './dto/get-vocab.dto';
import { EXCEL_COLUMN_LIST } from './vocabs.constant';
import { CommonExcelService, UtilsService } from 'src/common/providers';
import { StaticService } from 'src/static/static.service';

@Injectable()
export class VocabsService {
  constructor(
    private utilsService: UtilsService,
    private commonExcelService: CommonExcelService,
    private staticService: StaticService,
    private edustatusService: EdustatusService,
    @InjectModel(Vocab.name) private vocabModel: Model<VocabDocument>,
    @InjectModel(ReviewVocab.name) private reviewvocabModel: Model<ReviewVocabDocument>,
  ) {}

  /*
  * 단어 삭제
  * @params:
  *   vocabId: string    vocab id
  * @return: {
  *   string,
  * }
  */
  async deleteVocab(vacabId: string) {
    const result = await this.vocabModel.findByIdAndDelete(vacabId);
    return result._id.toString()
  }

  /*
  * 단어 수정
  * @params:
  *   vocabId: string    user id
  *   body: {
  *     contentsSerialNum: string
  *     vocab:             string
  *     audioFilePath:     string
  *     connSentence:      string
  *     value:             string
  *     meaningEn:         string
  *     previewVocabulary: string     "Y" || "N"
  *   }
  * @return: {
  *   id: string,
  *   userId: string,
  *   firstLevel: string,           사용자 최초 테스트 레벨
  *   latestLevel: string,          사용자 최고 테스트 레벨
  *   selectedLevel: string,        사용자 마지막 선택 레벨
  * }
  */
  async updateVocabById(vocabId: string, body: UpdateVocabDto) {
    const result = await this.vocabModel.findByIdAndUpdate(vocabId, { 
      $set: {
        contentsSerialNum: body.contentsSerialNum,
        vocab: body.vocab,
        audioFilePath: body.audioFilePath,
        connSentence: body.connSentence,
        value: body.value,
        meaningEn: body.meaningEn,
        previewVocabulary: body.previewVocabulary,
        updatedAt: now()
      }
    });

    return result._id.toString();
  }

  /*
  * 단어 DB 데이터 유효성 검증
  * @params:
  *   vocabId: string    vocab id
  * @return: {
  *   boolean,
  * }
  */
  async existVocabById(vocabId: string): Promise<boolean> {
    const vocab = await this.vocabModel.findById(vocabId);
    if (!vocab) {
      return false;
    }
    return true;
  }

  /*
  * 리뷰단어 DB 데이터 유효성 검증
  * @params:
  *   userId: string    user id
  *   reviewVocabId: string    reviewvocab id 
  * @return: {
  *   boolean,
  * }
  */
  async existReviewVocabById(userId, reviewVocabId: string): Promise<boolean> {
    const reviewvocab = await this.reviewvocabModel.findById(reviewVocabId);
    if (!reviewvocab) {
      return false;
    }
    if (reviewvocab.userId != userId) {
      return false;
    }
    return true;
  }

  /*
  * 사용자 리뷰단어 등록 함수
  * @params:
  *   user_id: string     user id
  *   vocab_id: string    vocab id
  *   level: string       level 
  * @return: {
  *   string,
  * }
  */
  async createReviewVocab(user_id, vocab_id, level: string) {
    var reviewVocab: ReviewVocab = new ReviewVocab()
    var objVocabId = new Types.ObjectId(vocab_id)

    const exist = await this.reviewvocabModel.findOne({
      userId: new Types.ObjectId(user_id),
      vocabId: objVocabId,
    });

    // 출석
    await this.edustatusService.createStudiedDates(user_id);

    if (exist) {
      if (exist.complete) {
        await this.reviewvocabModel.findByIdAndUpdate(exist._id, {
          correctCount: 0,
          complete: false,
        })        

        return exist._id.toString()
      } else {
        throw new ForbiddenException("Already Registered.");
      }
    } else {
      reviewVocab.userId = new Types.ObjectId(user_id);
      reviewVocab.level = level;
      reviewVocab.vocabId = objVocabId;
      
      const result = await new this.reviewvocabModel(reviewVocab).save()
  
      return result._id.toString()
    }
  }

  /*
  * 사용자 리뷰단어 완료 업데이트 함수
  * @params:
  *   user_id: string     user id
  *   reviewvocab_id: string    reviewvocab id
  * @return: {
  *   complete: boolean      완료 여부
  *   correctCount: number   완료 횟수
  * }
  */
  async updateReviewVocabById(user_id, reviewvocab_id: string): Promise<ReviewVocabResultDto> {
    let res = new ReviewVocabResultDto();
    let result = await this.reviewvocabModel.findByIdAndUpdate(reviewvocab_id, { 
      $inc: {correctCount: 1}
    });

    if (result.correctCount + 1 >= 3) {
      result.complete = true
      await result.save();
      await this.staticService.updateUserWords(user_id);
    }

    if (result.complete) {
      res.complete = result.complete
    } else {
      res.complete = false;
    }
    res.correctCount = result.correctCount + 1;

    return res
  }

  /*
  * 등록 단어 개별 조회
  * @params:
  *   vocabId: string     vocabId
  * @return: {
      contentsSerialNum: string
      vocab:             string
      audioFilePath:     string
      meaningEn:         string
      value:             string
      connSentence:      string
      previewVocabulary: string     "Y" | "N"
      level:             string
      connStory:         string     연결된 스토리 제목
    }
  */
  async getVocabById(vocabId: string): Promise<VocabDto> {
    const filter: FilterQuery<VocabDocument> = {
      _id: new Types.ObjectId(vocabId),
    };

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

    const projection: ProjectionFields<VocabDto> = {
      _id: 1,
      contentsSerialNum: 1,
      vocab: 1,
      audioFilePath: 1,
      meaningEn: 1,
      value: 1,
      connSentence: 1,
      previewVocabulary: 1,
      level: '$educontents.level',
      connStory: '$educontents.title',
      createdAt: 0,
      updatedAt: 0,
    };

    const cursor = await this.vocabModel.aggregate([
      { $match: filter },
      ...lookups,
      { $project: projection },
    ]);
    return cursor[0];
  }

  /*
  * 단어 목록 검색
  * @query:
  *   vocab:          string     vocab
  *   level:          string     
  *   contents_vocab: string     
  * @return: {
  *   total:              number
  *   data: [
  *     {
  *       contentsSerialNum: string
          vocab:             string
          audioFilePath:     string
          meaningEn:         string
          value:             string
          connSentence:      string
          previewVocabulary: string     "Y" | "N"
          level:             string
          connStory:         string     연결된 스토리 제목
        }
  *   ]
  * 
  */
  async getPagingVocabs(
    query: GetVocabsDto,
  ): Promise<PagingResDto<VocabDto> | Buffer> {
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

    var filter: FilterQuery<VocabDocument> = {vocab: ''}
    if (!query.level) {
      filter = {
        vocab: { $regex: query.vocab || '', $options: 'i' },
        'educontents.content': { $regex: query.contents_vocab || '', $options: 'i' },
      };
    } else {
      filter = {
        vocab: { $regex: query.vocab || '', $options: 'i' },
        'educontents.level': { $eq: query.level },
        'educontents.content': { $regex: query.contents_vocab || '', $options: 'i' },
      };
    }

    const projection: ProjectionFields<VocabDto> = {
      _id: 1,
      contentsSerialNum: 1,
      vocab: 1,
      audioFilePath: 1,
      meaningEn: 1,
      value: 1,
      connSentence: 1,
      previewVocabulary: 1,
      level: '$educontents.level',
      connStory: '$educontents.title',
    };

    const cursor = await this.vocabModel.aggregate([
      ...lookups,
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
  * 컨텐츠 시리얼 넘버별 핵심 단어 목록 검색
  * @query:
  *   contentsSerialNum:          string     vocab
  *   previewVocabulary:          string     
  * @return: {
  *   total:              number
  *   data: [
  *     {
  *       id:                string
  *       contentsSerialNum: string
          vocab:             string
          audioFilePath:     string
          meaningEn:         string
          value:             string
          connSentence:      string
          previewVocabulary: string     "Y" | "N"
        }
  *   ]
  */
  async getPagingCoreVocabsBySerialNum(
    query: GetCoreVocabDto,
  ): Promise<PagingResDto<VocabDto> | Buffer> {
    var filter: FilterQuery<VocabDocument> = {contentsSerialNum: ''}
    if (query.previewVocabulary == 'N') {
      filter = {
        contentsSerialNum: { $eq: query.contentsSerialNum },
      };
    } else {
      filter = {
        contentsSerialNum: { $eq: query.contentsSerialNum },
        previewVocabulary: { $eq: 'Y' },
      };
    }

    const projection: ProjectionFields<VocabDto> = {
      _id: 1,
      contentsSerialNum: 1,
      vocab: 1,
      audioFilePath: 1,
      meaningEn: 1,
      value: 1,
      connSentence: 1,
      previewVocabulary: 1,
    };

    const cursor = await this.vocabModel.aggregate([
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

  /*
  * 컨텐츠 시리얼 넘버별 핵심 단어 목록 검색
  * @params:
  *   user_id:          string
  * @return: {
  *   total:              number
  *   completed:          number
  *   data: [
  *     {
  *       id:                string
          vocab:             string
          audioFilePath:     string
          meaningEn:         string
          value:             string
          connSentence:      string
          complete:          boolean
        }
  *   ]
  */
  async getListReviewVocabs(
    user_id: string,
  ): Promise<ReviewVocabPagingResDto<ReviewVocabDto> | Buffer> {
    var query = new GetReviewVocabDto()
    query.userId = user_id;

    const lookups: PipelineStage[] = [
      {
        $lookup: {
          from: 'vocabs',
          localField: 'vocabId',
          foreignField: '_id',
          as: 'vocabs',
        },
      },
      {
        $unwind: {
          path: '$vocabs',
          preserveNullAndEmptyArrays: false,
        },
      },
    ];

    var filter: FilterQuery<ReviewVocabDocument> = {}
    filter = {
      userId: { $eq: new Types.ObjectId(user_id) },
    };

    const projection: ProjectionFields<VocabDto> = {
      _id: 1,
      vocab: "$vocabs.vocab",
      audioFilePath: "$vocabs.audioFilePath",
      meaningEn: "$vocabs.meaningEn",
      value: "$vocabs.value",
      connSentence: "$vocabs.connSentence",
      complete: 1,
    };

    const cursor = await this.reviewvocabModel.aggregate([
      ...lookups,
      { $match: filter },
      { $project: projection },
      { $sort: { createdAt: -1 } }
    ]);

    const completed_count = await this.reviewvocabModel.find({
      userId: { $eq: new Types.ObjectId(query.userId) },
      complete: { $eq: true },
    }).count();

    return {
      total: cursor.length || 0,
      completed: completed_count || 0,
      data: cursor,
    };
  }
}
