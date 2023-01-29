import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Vocab, VocabDocument } from './schemas/vocab.schema';

@Injectable()
export class VocabsService {
    constructor(@InjectModel(Vocab.name) private vocabModel: Model<VocabDocument>) {}

    async GetVocab(vocab_id: string): Promise<VocabDocument | false>{
        const vocab = await this.vocabModel.findById(vocab_id);
        if (!vocab){
            return false;
        }
        return vocab;
    }
}
