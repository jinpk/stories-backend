import {
  Controller,
  Get,
  Param,
  Delete,
  Patch,
  Post,
  Query,
  NotFoundException,
 } from '@nestjs/common';
 import {
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger'
import { ApiOkResponsePaginated } from 'src/common/decorators/response.decorator';
import { VocabDto, CoreTypeUpdateDto, CoreVocabDto, ReviewVocabDto } from './dto/vocab.dto';
import { GetVocabsDto, GetStaticsVocabDto } from './dto/get-vocab.dto';
import { VocabTestDto } from './dto/vocab-test.dto';
import { VocabsService } from './vocabs.service';
import { StaticsVocabDto } from './dto/vocab-statics.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { Public } from 'src/auth/decorator/auth.decorator';

@Controller('vocabs')
@ApiTags('vocabs')
@ApiBearerAuth()
export class VocabsController {
    constructor(private readonly vocabsService: VocabsService) {}
    @Patch('coretype/:vocabId')
    @ApiOperation({
      summary: '(ADMIN) 핵심 단어 적용, Y or N',
    })
    @ApiBody({ type: CoreTypeUpdateDto })
    async patchCoreType(@Param('vocabId') vocabId: string) {}
    
    @Patch('vocab/:vocabId')
    @ApiOperation({
      summary: '(ADMIN) 등록 단어 수정',
    })
    @ApiBody({ type: VocabDto })
    async patchVocab(@Param('vocabId') vocabId: string) {}

    @Delete(':vocabId')
    @ApiOperation({ summary: '(ADMIN) 단어 삭제' })
    deleteVocab(@Param('vocabId') vocabId: string) {}

    @Post('test/:vocabId')
    @ApiOperation({
      summary: 'Vocab 테스트 제출',
    })
    @ApiBody({ type: VocabTestDto })
    @ApiOkResponse({
      type: Boolean,
    })
    async checkVocabTest(@Query('userId') userId: string, @Param('vocabId') vocabId: string) {
      return true;
    }

    @Get('statics')
    @ApiOperation({
      summary: '(ADMIN) Vocab 퀴즈 이용 통계',
    })
    @ApiOkResponsePaginated(StaticsVocabDto)
    async getStaticsVocab(@Query() qeury: GetStaticsVocabDto) {}
    
    @Get(':vocabId')
    @Public()
    @ApiOperation({
      summary: 'Vocab 상세 조회',
    })
    @ApiOkResponse({
      status: 200,
      type: VocabDto,
    })
    async getVocab(@Param('vocabId') vocabId: string) {
      if (!(await this.vocabsService.existVocabById(vocabId))) {
        throw new NotFoundException('NotFound Contents');
      }
      return await this.vocabsService.getVocabById(vocabId);
    }

    @Get('')
    @ApiOperation({
      summary: '(ADMIN) Vocab 조회',
    })
    @ApiOkResponsePaginated(VocabDto)
    async getListVocab(@Query() query: GetVocabsDto) {}

    @Get('corevocab/:contentsId')
    @ApiOperation({
      summary: '시리즈별 핵심 Vocab 목록 조회',
    })
    @ApiOkResponsePaginated(CoreVocabDto)
    async getListCoreVocab(@Param('contentsId') contentsId: string) {}

    @Post('reviewquiz/:reveiwVocabId')
    @ApiOperation({
      summary: '사용자 review quiz단어 등록',
    })
    async saveUserReviewVocab(@Param('userId') userId: string, @Param('reveiwVocabId') reveiwVocabId: string) {}

    @Delete('reviewquiz/:reveiwVocabId')
    @ApiOperation({
      summary: '사용자 review quiz단어 삭제',
    })
    async deleteUserReviewVocab(@Param('reveiwVocabId') reveiwVocabId: string) {}

    @Get('reviewquiz/:userId')
    @ApiOperation({
      summary: '사용자 review quiz단어 목록 조회',
    })
    @ApiOkResponsePaginated(ReviewVocabDto)
    async getListUserReviewVocab(@Param('userId') userId: string) {}

    // 사용자 review 단어 완료숫자 조회 
}
