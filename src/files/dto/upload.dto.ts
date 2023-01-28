import { ApiProperty } from '@nestjs/swagger';

export class UploadFilesDto {
  static key = 'files';
  static max = 5;

  @ApiProperty({
    description: '업로드 파일',
    type: 'array',
    items: { type: 'string', format: 'binary' },
  })
  readonly files: Express.Multer.File[];
}

export class UploadFilesResDto {
  @ApiProperty({
    description: '업로드 파일 S3 Access Path',
  })
  paths: string[];
}
