import { Injectable, ConsoleLogger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { now } from 'mongoose';
import {
  FilterQuery,
  Model,
  PipelineStage,
  ProjectionFields,
  Types,
} from 'mongoose';
import { PagingResDto } from 'src/common/dto/response.dto';
import { Vocab, VocabDocument } from './schemas/vocab.schema';
import { VocabDto, CoreVocabDto, ReviewVocabDto } from './dto/vocab.dto';
import { UpdateVocabDto } from './dto/update-vocab.dto';
import { GetVocabsDto, GetStaticsVocabDto } from './dto/get-vocab.dto';
import { EXCEL_COLUMN_LIST } from './vocabs.constant';
import { CommonExcelService, UtilsService } from 'src/common/providers';

@Injectable()
export class VocabsService {
  constructor(
    private utilsService: UtilsService,
    private commonExcelService: CommonExcelService,
    @InjectModel(Vocab.name) private vocabModel: Model<VocabDocument>,
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

}
