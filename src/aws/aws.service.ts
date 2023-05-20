import { Injectable } from '@nestjs/common';
import * as AWS from 'aws-sdk';
import { SendEmailRequest } from 'aws-sdk/clients/ses';
import { createReadStream } from 'fs';
import { AppConfigService } from 'src/config';
import { SendEmailDto } from './dto/email.dto';
import { FilesToBucketDto } from './dto/s3.dto';
import * as XLSX from 'xlsx';

@Injectable()
export class AwsService {
  private s3: AWS.S3;
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
    this.parentJwtSecretKey = this.configService.ttmikJwtSecret;
  }

  get getParentJwtSecretKey(): string {
    return this.parentJwtSecretKey;
  }

  /*
  * 로컬에 있는 파일을 S3로 업로드하는 서비스 함수
  * @params:
  *   {paths, bucket}         FilesToBucketDto
  * @return:
  */
  async filesToBucket({ paths, bucket }: FilesToBucketDto): Promise<void> {
    for await (const path of paths) {
      await this.s3
        .putObject({
          Bucket: bucket,
          Body: createReadStream(path),
          Key: path,
        })
        .promise();
    }
  }

  /*
  * 벌크업로드 요청시 S3의 전체 컨텐츠 정보를 읽어오는 함수
  * @params:
  *   content:          string
  *   bucket:           string
  * @return:            Map<string, any>
  */
  async fileFromBucket(
    content: string,
    bucket: string,
  ): Promise<Map<string, any>> {
    var options = {
      Bucket: bucket,
      Key: content,
    };
    const excelmap = new Map<string, any>();
    excelmap.set('filename', content);

    return await this.s3
      .getObject(options)
      .promise()
      .then((file) => {
        var buffers = [];
        const contentmap = new Map<string, any>();
        buffers.push(file.Body);
        var buffer = Buffer.concat(buffers);
        var workbook = XLSX.read(buffer, { type: 'buffer' });
        for (const sheetname of workbook.SheetNames) {
          const sheet = workbook.Sheets[sheetname];
          const rows = XLSX.utils.sheet_to_json(sheet, {
            defval: '',
            raw: false,
          });
          contentmap.set(sheetname, rows);
        }

        excelmap.set('contents', contentmap);

        return excelmap;
      });
  }

  /*
  * S3 버켓의 파일 및 폴더 리스트 조회
  * @params:
  *   path:             string
  *   bucket:           string
  * @return:            string[]
  */
  async filesListFromBucket(path: string, bucket: string): Promise<string[]> {
    var options = {
      Bucket: bucket,
      Prefix: path,
    };
    var filelist: string[] = [];
    return await this.s3
      .listObjects(options)
      .promise()
      .then((data) => {
        for (const content of data.Contents) {
          if (content.Key == path) {
          } else {
            filelist.push(content.Key);
          }
        }
        return filelist;
      });
  }

  /*
  * AWS SES 이메일 발송 공통 함수
  * @params:
  *   params:           SendEmailDto
  * @return:            string
  */
  async sendEmail(params: SendEmailDto): Promise<string> {
    const payload: SendEmailRequest = {
      Source: 'TTMIK Stories <no-reply@mail.ttmikstories.app>',
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
