import { Injectable } from '@nestjs/common';
import * as AWS from 'aws-sdk';
import { createReadStream } from 'fs';
import { AppConfigService } from 'src/config';
import { FilesToBucketDto } from './dto/s3.dto';

@Injectable()
export class AwsService {
  private s3: AWS.S3;
  constructor(private readonly configService: AppConfigService) {
    this.s3 = new AWS.S3({
      region: 'us-east-1',
      accessKeyId: configService.awsAccessKey,
      secretAccessKey: configService.awsSecret,
    });
  }

  async filesToBucket({ paths, bucket }: FilesToBucketDto): Promise<void> {
    for await (const path of paths) {
      await this.s3
        .putObject({
          ACL: 'public-read',
          Bucket: bucket,
          Body: createReadStream(path),
          Key: path,
        })
        .promise();
    }
  }
}
