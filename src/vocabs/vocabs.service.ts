import { Injectable, ConsoleLogger } from '@nestjs/common';
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
import { VocabDto, CoreVocabDto, ReviewVocabDto } from './dto/vocab.dto';
import { UpdateVocabDto } from './dto/update-vocab.dto';
import { GetVocabsDto, GetReviewVocabDto, GetCoreVocabDto } from './dto/get-vocab.dto';
import { EXCEL_COLUMN_LIST } from './vocabs.constant';
import { CommonExcelService, UtilsService } from 'src/common/providers';

@Injectable()
export class VocabsService {
  constructor(
    private utilsService: UtilsService,
    private commonExcelService: CommonExcelService,
    @InjectModel(Vocab.name) private vocabModel: Model<VocabDocument>,
    @InjectModel(ReviewVocab.name) private reviewvocabModel: Model<ReviewVocabDocument>,
  ) {}

  async deleteVocab(id: string) {
    await this.vocabModel.findByIdAndDelete(id);
    return id
  }

  async updateVocabById(id: string, body: UpdateVocabDto) {
    await this.vocabModel.findByIdAndUpdate(id, { 
      $set: {body, updatedAt: now()}
    });
  }

  async existVocabById(id: string): Promise<boolean> {
    const vocab = await this.vocabModel.findById(id);
    if (!vocab) {
      return false;
    }
    return true;
  }

  async existReviewVocabById(user_id, id: string): Promise<boolean> {
    const reviewvocab = await this.reviewvocabModel.findById(id);
    if (!reviewvocab) {
      return false;
    }
    if (reviewvocab.userId != user_id) {
      return false;
    }
    return true;
  }

  async createReviewVocab(id: string, vocab_id: string) {
    var reviewVocab: ReviewVocab = new ReviewVocab()
    var objVocabId = new Types.ObjectId(vocab_id)
    reviewVocab = {
      userId: id,
      vocabId: objVocabId,
      complete: false,
    }
    const result = await new this.reviewvocabModel(reviewVocab).save()
    return result._id.toString()
  }

  async updateReviewVocabById(vocab_id: string) {
    await this.reviewvocabModel.findByIdAndUpdate(vocab_id, { 
      $set: {complete: true, updatedAt: now()}
    });
    return vocab_id
  }

  async getVocabById(id: string): Promise<VocabDto> {
    const filter: FilterQuery<VocabDocument> = {
      _id: new Types.ObjectId(id),
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
    };

    const cursor = await this.vocabModel.aggregate([
      { $match: filter },
      ...lookups,
      { $project: projection },
    ]);
    return cursor[0];
  }

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

  async getPagingReviewVocabs(
    user_id: string,
  ): Promise<ReviewVocabPagingResDto<ReviewVocabDto> | Buffer> {
    var query = new GetReviewVocabDto()
    query.userId = user_id;
    query.page = '1';
    query.limit = '1000';

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

    var filter: FilterQuery<ReviewVocabDocument> = {userId: {}}
    filter = {
      userId: { $eq: query.userId },
      complete: { $eq: false },
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
      { $sort: { createdAt: -1 } },
      this.utilsService.getCommonMongooseFacet(query),
    ]);

    const metdata = cursor[0].metadata;
    const data = cursor[0].data;

    const completed_count = await this.reviewvocabModel.find({
      userId: { $eq: query.userId },
      complete: { $eq: true },
    }).count();

    return {
      total: metdata[0]?.total || 0,
      completed: completed_count || 0,
      data: data,
    };
  }
}
