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
import { LibraryDto } from './dto/library.dto';
import { GetListUserLibraryDto } from './dto/get-library.dto'
import { ReadStory, ReadStoryDocument } from '../edustatus/schemas/readstory.schema';
import { Bookmark, BookmarkDocument } from '../educontents/schemas/bookmark.schema';
import { EduContents, EduContentsDocument } from '../educontents/schemas/educontents.schema';
import { UtilsService } from 'src/common/providers';

@Injectable()
export class LibraryService {
  constructor(
    private utilsService: UtilsService,
    @InjectModel(EduContents.name) private educontentsModel: Model<EduContentsDocument>,
    @InjectModel(Bookmark.name) private bookmarkModel: Model<BookmarkDocument>,
    @InjectModel(ReadStory.name) private readstoryModel: Model<ReadStoryDocument>,
  ) {}

  async GetUserLibraryById(
    query: GetListUserLibraryDto,
    user_id: string
    ): Promise<PagingResDto<LibraryDto> | Buffer> {
      var bookmarked: any[] = [];
      var stories: any[] = [];

      var filter: FilterQuery<EduContentsDocument> = {}
      if (query.level == "0")  {
      } else {
        filter.level = query.level;
      }

      const projection: ProjectionFields<LibraryDto> = {
        _id: 1,
        level: 1,
        title: 1,
        contentsSerialNum: 1,
        createdAt: 1,
        isCompleted: 1,
      };

      const cursor = await this.educontentsModel.aggregate([
          { $match: filter },
          { $project: projection },
      ]);

      // 북마크 or Not
      if (query.bookmarked.toString() == "true") {
        const bookmarks = await this.bookmarkModel.find({
            userId: { $eq: new Types.ObjectId(user_id) }
        });

        if (bookmarks.length != 0) {
          bookmarks.forEach((content, _) => {
            bookmarked.push(content.eduContentsId)
          })
        }

        cursor.forEach((content, _) => {
          if (!bookmarked.includes(content._id.toString())) {
            cursor.splice(content, 1)
          } else {}
        })
      } else {}

      // isCompleted: true or false
      const readstory = await this.readstoryModel.find({
        userId: { $eq: user_id }
      });

      if (readstory.length != 0) {
        readstory.forEach((content, _) => {
          stories.push(content.contentsSerialNum)
        })
      }

      cursor.forEach((content, _) => {
        if (stories.includes(content.contentsSerialNum)) {
          content.isCompleted = true
        } else {
          content.isCompleted = false
        }
      })

    const metdata = cursor.length;
    const data = cursor;

      return {
        total: metdata || 0,
        data: data,
    };
  }
}
