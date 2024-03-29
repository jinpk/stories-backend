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
  ForbiddenException,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConflictResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnprocessableEntityResponse,
} from '@nestjs/swagger';
import { ApiOkResponsePaginated } from 'src/common/decorators/response.decorator';
import {
  EduContentsDto,
  ContentsQuizDto,
  UploadContentsDto,
  BookmarkDto,
} from './dto/educontents.dto';
import {
  GetListEduContentsDto,
  GetListQuizDto,
  GetListBookmarkDto,
} from './dto/get-educontents.dto';
import {
  UpdateEduContentsDto,
  UpdateQuizsDto,
} from './dto/update-educontents.dto';
import { EducontentsService } from './educontents.service';
import { FilesFromBucketDto } from '../aws/dto/s3.dto';
import { Bulk } from './schemas/bulk.schema';

@Controller('educontents')
@ApiTags('educontents')
@ApiBearerAuth()
export class EducontentsController {
  constructor(private readonly educontentsService: EducontentsService) {}
  @Post('upload')
  @ApiOperation({
    summary: '(ADMIN) 컨텐츠 목록 업로드',
    description: `파일 벌크 업로드는 비동기로 진행됩니다.
    \n프론트에서 요청후 response에 bulkId를 받을 수 있고.
    \nbulkId를 가지고 주기적으로 GET bulks/{bulkId} 요청하여 현재 상태를 모니터링할 수 있습니다.`,
  })
  @ApiOkResponse({
    status: 200,
    type: UploadContentsDto,
  })
  @ApiUnprocessableEntityResponse({
    description: '입력한 경로에 파일이 없는 경우',
  })
  @ApiConflictResponse({
    description: '입력했던 폴더경로가 아직 처리진행중인경우',
  })
  async createContents(
    @Query() query: FilesFromBucketDto,
    @Request() req,
  ): Promise<UploadContentsDto> {
    if (!req.user.isAdmin) {
      throw new ForbiddenException('Not an Admin');
    }

    const bulkId = await this.educontentsService.createContentsList(query.path);
    return {
      bulkId,
    };
  }

  @Get('bulks/:bulkId')
  @ApiOperation({
    summary: '(ADMIN) 컨텐츠 목록 업로드 상태조회',
  })
  @ApiOkResponse({
    status: 200,
    type: Bulk,
  })
  async getBulk(
    @Param('bulkId') bulkId: string,
    @Request() req,
  ): Promise<Bulk> {
    if (!req.user.isAdmin) {
      throw new ForbiddenException('Not an Admin');
    }

    return await this.educontentsService.getBulk(bulkId);
  }

  @Get('recentbulk/')
  @ApiOperation({
    summary: '(ADMIN) 최근 Bulk 업로드 날짜 조회',
  })
  @ApiOkResponse({
    status: 200,
    type: Object,
  })
  async getRecentBulk(
    @Request() req,
  ): Promise<Object> {
    if (!req.user.isAdmin) {
      throw new ForbiddenException('Not an Admin');
    }

    return await this.educontentsService.getRecentBulk();
  }

  @Put(':educontentsId')
  @ApiOperation({
    summary: '(ADMIN) 학습 컨텐츠 수정',
  })
  @ApiBody({ type: UpdateEduContentsDto })
  async patchEduContents(
    @Param('educontentsId') educontentsId: string,
    @Request() req,
    @Body() body,
  ) {
    if (!req.user.isAdmin) {
      throw new UnauthorizedException('Not an Admin');
    }
    if (!(await this.educontentsService.existEduContentById(educontentsId))) {
      throw new NotFoundException('NotFound Contents');
    }
    return await this.educontentsService.updateEduContentsById(
      educontentsId,
      body,
    );
  }

  @Delete(':educontentsId')
  @ApiOperation({
    summary: '(ADMIN) 학습 컨텐츠 삭제',
  })
  async deleteEduContents(
    @Param('educontentsId') educontentsId: string,
    @Request() req,
  ) {
    if (!req.user.isAdmin) {
      throw new UnauthorizedException('Not an Admin');
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
  async getExcelDownloadPath(@Request() req) {}

  @Get('')
  @ApiOperation({
    summary: '학습 컨텐츠 조회',
  })
  @ApiOkResponsePaginated(EduContentsDto)
  async listEduContents(@Query() query: GetListEduContentsDto, @Request() req) {
    return await this.educontentsService.getPagingEduContents(query);
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

  @Post('quiz')
  @ApiOperation({
    summary: '(ADMIN) 컨텐츠 퀴즈 등록',
  })
  @ApiBody({
    type: ContentsQuizDto,
  })
  async createContentsQuiz(@Body() body, @Request() req) {
    if (!req.user.isAdmin) {
      throw new UnauthorizedException('Not an Admin');
    }
    return await this.educontentsService.createQuiz(body);
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
    @Body() body,
  ) {
    if (!req.user.isAdmin) {
      throw new UnauthorizedException('Not an Admin');
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
      throw new UnauthorizedException('Not an Admin');
    }
    if (!(await this.educontentsService.existQuizsById(quizId))) {
      throw new NotFoundException('NotFound Quiz');
    }
    return await this.educontentsService.deleteQuizs(quizId);
  }

  @Get('quiz/:contentsSerialNum')
  @ApiOperation({
    summary: '학습 컨텐츠 별 퀴즈 조회',
  })
  @ApiOkResponsePaginated(ContentsQuizDto)
  async listContentsQuiz(
    @Param('contentsSerialNum') contentsSerialNum: string,
    @Query() query: GetListQuizDto,
    @Request() req,
  ) {
    return await this.educontentsService.getPagingQuizs(
      contentsSerialNum,
      query,
    );
  }

  @Post('bookmark/:educontentsId')
  @ApiOperation({
    summary: '컨텐츠 북마크 등록',
  })
  async saveBookmark(
    @Param('educontentsId') educontentsId: string,
    @Request() req,
  ) {
    return await this.educontentsService.createBookmark(
      req.user.id,
      educontentsId,
    );
  }

  @Delete('bookmark/:bookmarkId')
  @ApiOperation({
    summary: '컨텐츠 북마크 삭제',
  })
  async deleteBookmark(
    @Param('bookmarkId') bookmarkId: string,
    @Request() req,
  ) {
    return await this.educontentsService.deleteBookmark(
      req.user.id,
      bookmarkId,
    );
  }

  @Get('bookmark/me')
  @ApiOperation({
    summary: '나의 컨텐츠 북마크 리스트 조회',
  })
  @ApiOkResponsePaginated(BookmarkDto)
  async listBookmark(@Query() query: GetListBookmarkDto, @Request() req) {
    return await this.educontentsService.getPagingBookmark(req.user.id, query);
  }
}
