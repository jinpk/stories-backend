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

  async filesFromBucket(path: string, bucket: string): Promise<void> {
    var options = {
      Bucket : bucket,
      Key: path,
    }
    var file = await this.s3.getObject(options).createReadStream();
    var buffers = [];
    file.on('data', function (data) {
      buffers.push(data);
    });
    console.log(buffers)

    file.on('end', function() {
      var buffer = Buffer.concat(buffers);
      var workbook = XLSX.read(buffer, {type: 'buffer'});
      
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const rows = XLSX.utils.sheet_to_json(sheet, {
        defval: null,
      })
      this.logger.debug(rows);

      for (const row of rows) {
        const values = Object.keys(row).map(key => row[key]);
        console.log(values)
      }
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
