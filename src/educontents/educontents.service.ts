import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { EduContents, EduContentsDocument } from './schemas/educontents.schema';
import { AwsService } from '../aws/aws.service'
import { FilesFromBucketDto } from '../aws/dto/s3.dto'

@Injectable()
export class EducontentsService {
  constructor(
      @InjectModel(EduContents.name) private educontentsModel: Model<EduContentsDocument>,
      private awsService: AwsService,
    ) {}
  
  async GetEducontents(educontents_id: string): Promise<EduContentsDocument | false> {
    const educontents = await this.educontentsModel.findById(educontents_id);
    if (!educontents) {
      return false;
    }
    return educontents;
  }

  async createContentsList(path: string, bucket: string): Promise<number>{
    var total = 0;
    var result = await this.awsService.filesFromBucket(path, bucket)
    console.log(result)
    return;
  }
}
