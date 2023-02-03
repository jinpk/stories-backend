import {
    Controller,
    Get,
    Param,
    Delete,
    Patch,
    Post,
    Query,
} from '@nestjs/common';
import {
    ApiBearerAuth,
    ApiBody,
    ApiOkResponse,
    ApiOperation,
    ApiTags,
} from '@nestjs/swagger'
import { ApiOkResponsePaginated } from 'src/common/decorators/response.decorator';
import { EduContentsDto, ContentsQuizDto, UserEduInfoDto, ContentsQuizResultDto } from './dto/educontents.dto';
import { EduProgressDto } from './dto/eduprogress.dto';
import { GetListEduContentsDto, GetListQuizDto, GetContentsQuizResultDto} from './dto/get-educontents.dto';
import { EducontentsService } from './educontents.service';

@Controller('educontents')
@ApiTags('educontents')
@ApiBearerAuth()
export class EducontentsController {
    constructor(private readonly educontentsService: EducontentsService) {}
    @Post('upload')
    @ApiOperation({
      summary: '(ADMIN) 컨텐츠 목록 업로드',
    })
    async createContentsList() {
    }

    @Post('quiz/:educontents_id')
    @ApiOperation({
      summary: '(ADMIN) 컨텐츠 퀴즈 등록',
    })
    @ApiBody({
      type:ContentsQuizDto,
    })
    async createContentsQuiz(@Param('educontents_id') educontents_id: string) {
    }

    @Patch('quiz/:quiz_id')
    @ApiOperation({
      summary: '(ADMIN) 컨텐츠 단어 퀴즈 수정',
    })
    async patchContentsQuiz(@Param('quiz_id') quiz_id: string) {
    }

    @Delete('quiz/:quiz_id')
    @ApiOperation({
      summary: '(ADMIN) 컨텐츠 단어 퀴즈 삭제',
    })
    async deleteContentsQuiz(@Param('quiz_id') quiz_id: string) {
    }

    @Patch(':educontents_id')
    @ApiOperation({
      summary: '(ADMIN) 학습 컨텐츠 수정',
    })
    @ApiBody({ type: EduContentsDto })
    async patchEduContents(@Param('educontents_id') educontents_id: string) {}

    @Delete(':educontents_id')
    @ApiOperation({
        summary: '(ADMIN) 학습 컨텐츠 삭제'
    })
    async deleteEduContents(@Param('educontents_id') educontents_id: string) {}

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
    }
    
    @Get(':educontents_id')
    @ApiOperation({
      summary: '학습 컨텐츠 상세 조회',
    })
    async getEduContents() {
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

    @Get('quiz/:educontents_id')
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
}
