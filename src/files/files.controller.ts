import {
  BadRequestException,
  Controller,
  Post,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiCreatedResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { unlink } from 'fs';
import { AwsService } from 'src/aws/aws.service';
import { UploadFilesDto, UploadFilesResDto } from './dto/upload.dto';

@Controller('files')
@ApiTags('files')
@ApiBearerAuth()
export class FilesController {
  constructor(private readonly awsService: AwsService) {}

  @Post()
  @ApiOperation({ summary: '공통 파일 업로드' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: UploadFilesDto })
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: UploadFilesDto.key, maxCount: UploadFilesDto.max },
    ]),
  )
  @ApiCreatedResponse({
    type: UploadFilesResDto,
  })
  async uploadFiles(@UploadedFiles() { files }: UploadFilesDto) {
    if (!files || !files.length) {
      throw new BadRequestException('files is a empty array.');
    }
    const paths = files.map((x) => x.path);

    await this.awsService.filesToBucket({
      bucket: 'files.stories',
      paths,
    });

    paths.forEach((path) => unlink(path, console.error));

    return paths;
  }
}
