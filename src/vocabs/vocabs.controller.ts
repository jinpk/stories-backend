import {
  Controller,
  Get,
  Param,
  Delete,
  Put,
  Post,
  Query,
  NotFoundException,
  Body,
 } from '@nestjs/common';
 import {
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger'
import { ApiOkResponsePaginated } from 'src/common/decorators/response.decorator';
import { VocabDto, CoreVocabDto, ReviewVocabDto } from './dto/vocab.dto';
import { UpdateVocabDto } from './dto/update-vocab.dto';
import { GetVocabsDto, GetStaticsVocabDto, GetCoreVocabDto } from './dto/get-vocab.dto';
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
    @Put(':vocabId')
    @ApiOperation({
      summary: '(ADMIN) 등록 단어 수정',
    })
    async updateVocab(@Body() body: UpdateVocabDto, @Param('vocabId') vocabId: string) {
      console.log(body)
      if (!(await this.vocabsService.existVocabById(vocabId))) {
        throw new NotFoundException('NotFound Vocab');
      }
      await this.vocabsService.updateVocabById(vocabId, body)
    }

    @Delete(':vocabId')
    @ApiOperation({ summary: '(ADMIN) 단어 삭제' })
    @ApiOkResponse({
      status: 200,
      type: String,
    })
    async deleteVocab(@Param('vocabId') vocabId: string) {
      return await this.vocabsService.deleteVocab(vocabId);
    }

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

    @Get(':vocabId')
    @ApiOperation({
      summary: 'Vocab 상세 조회',
    })
    @ApiOkResponse({
      status: 200,
      type: VocabDto,
    })
    async getVocab(@Param('vocabId') vocabId: string) {
      if (!(await this.vocabsService.existVocabById(vocabId))) {
        throw new NotFoundException('NotFound Vocab');
      }
      return await this.vocabsService.getVocabById(vocabId);
    }

    // @Get('statics')
    // @ApiOperation({
    //   summary: '(ADMIN) Vocab 퀴즈 이용 통계',
    // })
    // @ApiOkResponsePaginated(StaticsVocabDto)
    // async getStaticsVocab(@Query() qeury: GetStaticsVocabDto) {
    //   return await this.vocabsService.getStaticVocabs(query)
    // }

    @Get('')
    @ApiOperation({
      summary: '(ADMIN) Vocab 조회',
    })
    @ApiOkResponsePaginated(VocabDto)
    async listVocabs(@Query() query: GetVocabsDto) {
      return await this.vocabsService.getPagingVocabs(query)
    }

    @Get('corevocab/:serialNum')
    @ApiOperation({
      summary: '핵심 Vocab 목록 조회 By serialNum',
    })
    @ApiOkResponsePaginated(CoreVocabDto)
    async getListCoreVocab(@Query() query: GetCoreVocabDto) {
      return await this.vocabsService.getPagingCoreVocabsBySerialNum(query)
    }

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
