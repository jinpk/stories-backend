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
  @ApiOperation({
    summary: '공통 파일 업로드',
    description: `해당 컨트롤러는 사용자의 파일을 서버가 받아 S3로 업로드 해주는 API입니다.
    \n파일 조회는 S3 Path 경로를 사용하여 프론트에서 직접 조회 가능합니다.`,
  })
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

    // Multer > Disk > S3에 파일 업로드 후 Disk 가비지 파일 데이터 삭제
    paths.forEach((path) => unlink(path, console.error));

    return paths;
  }
}
