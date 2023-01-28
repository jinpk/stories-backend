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
import { UploadFilesDto, UploadFilesResDto } from './dto/upload.dto';

@Controller('files')
@ApiTags('files')
@ApiBearerAuth()
export class FilesController {
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
  uploadFiles(@UploadedFiles() { files }: UploadFilesDto) {
    if (!files || !files.length) {
      throw new BadRequestException('files을 업로드 해주세요.');
    }
    console.log(files);
    return files.map((x) => x.path);
  }
}
