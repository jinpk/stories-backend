import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Library, LibraryDocument } from './schemas/library.schema';

@Injectable()
export class LibraryService {
    constructor(
        @InjectModel(Library.name) private libraryModel: Model<LibraryDocument>,
      ) {}
    
      async GetLibrary(Library_id: string): Promise<LibraryDocument | false> {
        const library = await this.libraryModel.findById(Library_id);
        if (!library) {
          return false;
        }
        return library;
      }
}
