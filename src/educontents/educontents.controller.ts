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
import { UpdateEduContentsDto, UpdateQuizsDto } from './dto/update-educontents.dto';
import { GetListAudioPlayerDto } from './dto/get-audioplayer.dto';
import { EducontentsService } from './educontents.service';
import { FilesFromBucketDto } from '../aws/dto/s3.dto'

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
  async createContentsQuiz(@Param('educontents_id') educontents_id: string, @Request() req) {
  }

  @Put('quiz/:quizId')
  @ApiOperation({
    summary: '(ADMIN) 컨텐츠 단어 퀴즈 수정',
  })
  @ApiBody({
    type: UpdateQuizsDto,
  })
  async updateContentsQuiz(
    @Param('quizId') quizId: string,
    @Request() req,
    @Body() body) {
      if (!req.user.isAdmin) {
        throw new UnauthorizedException('Not an Admin')
      }
      if (!(await this.educontentsService.existQuizsById(quizId))) {
        throw new NotFoundException('NotFound Quiz');
      }
      return await this.educontentsService.updateQuizsById(quizId, body);
  }

  @Delete('quiz/:quizId')
  @ApiOperation({
    summary: '(ADMIN) 컨텐츠 단어 퀴즈 삭제',
  })
  async deleteContentsQuiz(@Param('quizId') quizId: string, @Request() req) {
    if (!req.user.isAdmin) {
      throw new UnauthorizedException('Not an Admin')
    }
    if (!(await this.educontentsService.existQuizsById(quizId))) {
      throw new NotFoundException('NotFound Quiz');
    }
    return await this.educontentsService.deleteQuizs(quizId);
  }

  @Put(':educontentsId')
  @ApiOperation({
    summary: '(ADMIN) 학습 컨텐츠 수정',
  })
  @ApiBody({ type: UpdateEduContentsDto })
  async patchEduContents(
    @Param('educontentsId') educontentsId: string,
    @Request() req,
    @Body() body) {
      if (!req.user.isAdmin) {
        throw new UnauthorizedException('Not an Admin')
      }
      if (!(await this.educontentsService.existEduContentById(educontentsId))) {
        throw new NotFoundException('NotFound Contents');
      }
      return await this.educontentsService.updateEduContentsById(educontentsId, body)
  }

  @Delete(':educontentsId')
  @ApiOperation({
      summary: '(ADMIN) 학습 컨텐츠 삭제'
  })
  async deleteEduContents(
    @Param('educontentsId') educontentsId: string,
    @Request() req) {
      if (!req.user.isAdmin) {
        throw new UnauthorizedException('Not an Admin')
      }
      if (!(await this.educontentsService.existEduContentById(educontentsId))) {
        throw new NotFoundException('NotFound Contents');
      }
      return await this.educontentsService.deleteEduContents(educontentsId);
  }

  @Get('downloadexecel')
  @ApiOperation({
    summary: '(ADMIN) 업로드 액셀 양식 다운로드',
  })
  async getExcelDownloadPath(@Request() req) {
  }

  @Get('eduinfo')
  @ApiOperation({
    summary: '(ADMIN) 회원상세 학습정보',
  })
  @ApiOkResponse({
      type: UserEduInfoDto,
  })
  async getUserLevelTest(@Param('userId') userId: string, @Request() req) {

  }

  @Get('')
  @ApiOperation({
    summary: '(ADMIN) 학습 컨텐츠 조회',
  })
  @ApiOkResponsePaginated(EduContentsDto)
  async listEduContents(@Query() query: GetListEduContentsDto, @Request() req) {
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
