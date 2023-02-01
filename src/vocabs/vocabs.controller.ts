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
import { VocabDto, CoreTypeUpdateDto } from './dto/vocab.dto';
import { GetVocabsDto, GetStaticsVocabDto } from './dto/get-vocab.dto';
import { VocabTestDto } from './dto/vocab-test.dto';
import { VocabsService } from './vocabs.service';
import { StaticsVocabDto } from './dto/vocab-statics.dto';

@Controller('vocabs')
@ApiTags('vocabs')
@ApiBearerAuth()
export class VocabsController {
    constructor(private readonly vocabsService: VocabsService) {}
    @Patch('coretype/:vocab_id')
    @ApiOperation({
      summary: '(ADMIN) 핵심 단어 적용, USE or UNUSE',
    })
    @ApiBody({ type: CoreTypeUpdateDto })
    async patchCoreType(@Param('vocab_id') vocab_id: string) {}
    
    @Patch('vocab/:vocab_id')
    @ApiOperation({
      summary: '(ADMIN) 등록 단어 수정',
    })
    @ApiBody({ type: VocabDto })
    async patchVocab(@Param('vocab_id') vocab_id: string) {}

    @Delete(':vocab_id')
    @ApiOperation({ summary: '(ADMIN) 단어 삭제' })
    deleteVocab(@Param('vocab_id') vocab_id: string) {}

    @Post('test/:vocab_id')
    @ApiOperation({
      summary: 'Vocab 테스트 제출',
    })
    @ApiBody({ type: VocabTestDto })
    @ApiOkResponse({
      type: Boolean,
    })
    async checkVocabTest(@Param('vocab_id') vocab_id: string) {
      return true;
    }

    @Get('statics')
    @ApiOperation({
      summary: '(ADMIN) Vocab 퀴즈 이용 통계',
    })
    @ApiOkResponsePaginated(StaticsVocabDto)
    async getStaticsVocab(@Query() qeury: GetStaticsVocabDto) {}
    
    @Get(':vocab_id')
    @ApiOperation({
      summary: 'Vocab 상세 조회',
    })
    @ApiOkResponse({
      type: VocabDto,
    })
    async getVocab(@Param('vocab_id') vocab_id: string) {
      const vocab = new VocabDto();
      return vocab;
    }

    @Get('')
    @ApiOperation({
      summary: '(ADMIN) Vocab 조회',
    })
    @ApiOkResponsePaginated(VocabDto)
    async getListVocab(@Query() query: GetVocabsDto) {}
}
