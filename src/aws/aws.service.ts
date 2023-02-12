import { Injectable, ConsoleLogger } from '@nestjs/common';
import * as AWS from 'aws-sdk';
import { SendEmailRequest } from 'aws-sdk/clients/ses';
import { createReadStream } from 'fs';
import { AppConfigService } from 'src/config';
import { SendEmailDto } from './dto/email.dto';
import { FilesToBucketDto, FilesFromBucketDto } from './dto/s3.dto';
import * as XLSX from 'xlsx';

@Injectable()
export class AwsService {
  private s3: AWS.S3;
  private ssm: AWS.SSM;
  private ses: AWS.SES;

  private parentJwtSecretKey: string;

  constructor(private readonly configService: AppConfigService) {
    AWS.config.update({
      region: 'us-east-1',
      accessKeyId: configService.awsAccessKey,
      secretAccessKey: configService.awsSecret,
    });
    this.s3 = new AWS.S3();
    this.ses = new AWS.SES();
    this.ssm = new AWS.SSM();
    this.ssm.getParameter({ Name: '/ttmik-jwt-secrets-key' }, (err, data) => {
      if (err) {
        console.error(err);
      } else {
        this.parentJwtSecretKey = data.Parameter.Value;
      }
    });
  }

  get getParentJwtSecretKey(): string {
    return this.parentJwtSecretKey;
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

  async fileFromBucket(content: string, bucket: string): Promise<Map<string, any>> {
    var options = {
      Bucket : bucket,
      Key: content,
    }
    var jsonarr = [];    
    const excelmap = new Map<string, any>();
    excelmap.set('filename', content)

    return await this.s3.getObject(options).promise().then((file) => {
      var buffers = [];
      const contentmap = new Map<string, any>();
      buffers.push(file.Body)
      var buffer = Buffer.concat(buffers);
      var workbook = XLSX.read(buffer, {type: 'buffer'});
      for (const sheetname of workbook.SheetNames) {
        const sheet = workbook.Sheets[sheetname];
        const rows = XLSX.utils.sheet_to_json(sheet, {
          defval: '',
          raw: false,
        });
        contentmap.set(sheetname, rows)
      }

      excelmap.set('contents', contentmap)

      return excelmap
    });
  }

  async filesListFromBucket(path: string, bucket: string): Promise<string[]> {
    var options = {
      Bucket : bucket,
      Prefix: path,
    };
    var filelist: string[] = [];
    return await this.s3.listObjects(options).promise().then((data) => {
      for (const content of data.Contents) {
        if (content.Key == path) {
        } else {
          filelist.push(content.Key);
        }
      }
      return filelist
    });
  }

  async sendEmail(params: SendEmailDto): Promise<string> {
    const payload: SendEmailRequest = {
      Source: '<no-reply>@ttmikstories.app',
      Destination: {
        ToAddresses: params.addrs,
      },
      Message: {
        Body: {
          [params.dataType === 'html' ? 'Html' : 'Text']: {
            Data: params.data,
            Charset: 'utf-8',
          },
        },
        Subject: {
          Data: params.subject,
          Charset: 'utf-8',
        },
      },
    };
    return new Promise((resolve, reject) => {
      this.ses.sendEmail(payload, (err, data) => {
        if (err) {
          reject(err);
        } else {
          resolve(data.MessageId);
        }
      });
    });
  }
}
