import {
  Controller,
  Get,
  Param,
  Delete,
  Put,
  Post,
  Query,
  NotFoundException,
  UnauthorizedException,
  Body,
  Request,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger'
import { ApiOkResponsePaginated } from 'src/common/decorators/response.decorator';
import { EduContentsDto, ContentsQuizDto, UserEduInfoDto, ContentsQuizResultDto, UploadContentsDto } from './dto/educontents.dto';
import { AudioPlayerDto } from './dto/audioplayer.dto';
import { EduProgressDto } from './dto/eduprogress.dto';
import { GetListEduContentsDto, GetListQuizDto, GetContentsQuizResultDto} from './dto/get-educontents.dto';
import { GetListAudioPlayerDto } from './dto/get-audioplayer.dto';
import { EducontentsService } from './educontents.service';
import { FilesFromBucketDto } from '../aws/dto/s3.dto'
import { Public } from 'src/auth/decorator/auth.decorator';

@Controller('educontents')
@ApiTags('educontents')
@ApiBearerAuth()
// @ApiBearerAuth()
export class EducontentsController {
  constructor(private readonly educontentsService: EducontentsService) {}
  @Post('upload')
  @ApiOperation({
    summary: '(ADMIN) 컨텐츠 목록 업로드',
  })
  @ApiOkResponse({
    status: 200,
    type: UploadContentsDto,
  })
  async createContents(@Query() query: FilesFromBucketDto, @Request() req) {
    if (!req.user.isAdmin) {
      throw new UnauthorizedException('Not an Admin')
    }
    const total = await this.educontentsService.createContentsList(query.path, query.bucket)
    return total
  }

  @Post('quiz/:educontentsId')
  @ApiOperation({
    summary: '(ADMIN) 컨텐츠 퀴즈 등록',
  })
  @ApiBody({
    type:ContentsQuizDto,
  })
  async createContentsQuiz(@Param('educontents_id') educontents_id: string) {
  }

  @Put('quiz/:quizId')
  @ApiOperation({
    summary: '(ADMIN) 컨텐츠 단어 퀴즈 수정',
  })
  async patchContentsQuiz(@Param('quizId') quizId: string) {
  }

  @Delete('quiz/:quizId')
  @ApiOperation({
    summary: '(ADMIN) 컨텐츠 단어 퀴즈 삭제',
  })
  async deleteContentsQuiz(@Param('quizId') quizId: string) {
  }

  @Put(':educontentsId')
  @ApiOperation({
    summary: '(ADMIN) 학습 컨텐츠 수정',
  })
  @ApiBody({ type: EduContentsDto })
  async patchEduContents(@Param('educontentsId') educontentsId: string) {}

  @Delete(':educontentsId')
  @ApiOperation({
      summary: '(ADMIN) 학습 컨텐츠 삭제'
  })
  async deleteEduContents(@Param('educontentsId') educontentsId: string) {}

  @Get('downloadexecel')
  @ApiOperation({
    summary: '(ADMIN) 업로드 액셀 양식 다운로드',
  })
  async getExcelDownloadPath() {
  }

  @Get('eduinfo')
  @ApiOperation({
    summary: '(ADMIN) 회원상세 학습정보',
  })
  @ApiOkResponse({
      type: UserEduInfoDto,
  })
  async getUserLevelTest(@Param('userId') userId: string) {}

  @Get('')
  @ApiOperation({
    summary: '학습 컨텐츠 조회',
  })
  @ApiOkResponsePaginated(EduContentsDto)
  async listEduContents(@Query() query: GetListEduContentsDto) {
    return await this.educontentsService.getPagingEduContents(query)
  }
  
  @Get(':educontentsId')
  @ApiOperation({
    summary: '학습 컨텐츠 상세 조회',
  })
  async getEduContents(@Param('educontentsId') educontentsId: string) {
    if (!(await this.educontentsService.existEduContentById(educontentsId))) {
      throw new NotFoundException('NotFound Contents');
    }
    return await this.educontentsService.getEduContentById(educontentsId);
  }

  @Post('result')
  @ApiOperation({
    summary: '사용자 학습컨텐츠 퀴즈 결과 제출',
  })
  @ApiBody({ type: GetContentsQuizResultDto })
  @ApiOkResponse({
    type:    ContentsQuizResultDto,
  })
  async saveLevelTestResult(@Param('userId') userId: string) {}

  @Post('bookmark')
  @ApiOperation({
    summary: '컨텐츠 북마크 등록',
  })
  async saveBookmark() {
  }

  @Delete('bookmark')
  @ApiOperation({
    summary: '컨텐츠 북마크 삭제',
  })
  async deleteBookmark(@Param('bookmarkId') bookmarkId: string) {
  }

  @Get('quiz/:educontentsId')
  @ApiOperation({
    summary: '학습 컨텐츠 별 퀴즈 조회',
  })
  @ApiOkResponsePaginated(ContentsQuizDto)
  async listContentsQuiz(@Query() query: GetListQuizDto) {
  }

  @Get('progress')
  @ApiOperation({
    summary: 'HOME 사용자 학습 진행상황',
  })
  @ApiOkResponse({
    type: EduProgressDto,
  })
  async getEduProgress(@Param('userId') userId: string) {
  }

  @Get('audioplayer')
  @ApiOperation({
    summary: '사용자 오디오 플레이어 목록 조회',
  })
  @ApiOkResponsePaginated(AudioPlayerDto)
  async listAudioPlayer(@Param('userId') userId: string, @Query() query: GetListAudioPlayerDto) {
  }
}
