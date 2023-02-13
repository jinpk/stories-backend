import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  FilterQuery,
  Model,
  PipelineStage,
  ProjectionFields,
  Types,
} from 'mongoose';
import { Vocab, VocabDocument } from './schemas/vocab.schema';
import { VocabDto, CoreTypeUpdateDto, CoreVocabDto, ReviewVocabDto } from './dto/vocab.dto';
import { CommonExcelService, UtilsService } from 'src/common/providers';

@Injectable()
export class VocabsService {
  constructor(
    private utilsService: UtilsService,
    private commonExcelService: CommonExcelService,
    @InjectModel(Vocab.name) private vocabModel: Model<VocabDocument>,
  ) {}

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
      // { $sort: { createdAt: -1 } },
    ]);

    // const metdata = cursor[0].metadata;
    // const data = cursor[0].data;

    // if (query.excel === '1') {
    //   return await this.commonExcelService.listToExcelBuffer(
    //     EXCEL_COLUMN_LIST_SENT,
    //     data,
    //   );
    // }
    return cursor[0];
  }

  async lookupWithContent() {
    const lookups: PipelineStage[] = [
      {
        $lookup: {
          from: 'vocabs',
          localField: 'contentsSerialNum',
          foreignField: 'contentsSerialNum',
          as: 'vocabs',
        },
      },
      {
        $unwind: {
          path: '$vocabs',
          preserveNullAndEmptyArrays: false,
        },
      },
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
      _id: 0,
      id: '$vocabs._id',
      nickname: '$users.nickname',
      name: '$vocabs.name',
      description: '$vocabs.description',
      type: '$vocabs.type',
      start: '$vocabs.start',
      end: '$vocabs.end',
      value: '$vocabs.value',
      userId: 1,
      createdAt: 1,
    };

    const cursor = await this.vocabModel.aggregate([
      ...lookups,
      { $project: projection },
      { $sort: { createdAt: -1 } },
      // this.utilsService.getCommonMongooseFacet(query),
    ]);

    const metdata = cursor[0].metadata;
    const data = cursor[0].data;

    // if (query.excel === '1') {
    //   return await this.commonExcelService.listToExcelBuffer(
    //     EXCEL_COLUMN_LIST_SENT,
    //     data,
    //   );
    // }

    return {
      total: metdata[0]?.total || 0,
      data: data,
    };
  }
}
