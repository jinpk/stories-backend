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
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger'
import { ApiOkResponsePaginated } from 'src/common/decorators/response.decorator';
import {
  VocabDto,
  CoreVocabDto,
  ReviewVocabDto,
  ReviewVocabResultDto
} from './dto/vocab.dto';
import { UpdateVocabDto } from './dto/update-vocab.dto';
import { GetVocabsDto, GetCoreVocabDto } from './dto/get-vocab.dto';
import { VocabsService } from './vocabs.service';

@Controller('vocabs')
@ApiTags('vocabs')
@ApiBearerAuth()
export class VocabsController {
    constructor(private readonly vocabsService: VocabsService) {}
    @Put(':vocabId')
    @ApiOperation({
      summary: '(ADMIN) 등록 단어 수정',
    })
    async updateVocab(
      @Body() body: UpdateVocabDto,
      @Param('vocabId') vocabId: string,
      @Request() req) {
        if (!req.user.isAdmin) {
          throw new UnauthorizedException('Not an Admin')
        }
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
    async deleteVocab(@Param('vocabId') vocabId: string, @Request() req) {
      if (!req.user.isAdmin) {
        throw new UnauthorizedException('Not an Admin')
      }
      if (!(await this.vocabsService.existVocabById(vocabId))) {
        throw new NotFoundException('NotFound Vocab');
      }
      return await this.vocabsService.deleteVocab(vocabId);
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
      summary: 'Vocab 목록 조회 By serialNum',
      description: "contentsSerialNumber 사용, 각 스토리에 해당하는 단어 목록 호출, 'Y'인 경우 핵심단어만, 'N'인 경우 전체 단어"
    })
    @ApiOkResponsePaginated(CoreVocabDto)
    async getListCoreVocab(@Query() query: GetCoreVocabDto) {
      return await this.vocabsService.getPagingCoreVocabsBySerialNum(query)
    }

    @Post('reviewquiz/:vocabId&:level')
    @ApiOperation({
      summary: '사용자 review quiz단어 등록',
    })
    @ApiOkResponse({
      status: 200,
      type: String,
    })
    async saveUserReviewVocab(
      @Request() req, 
      @Param('vocabId') vocabId: string,
      @Param('level') level: string) {
      if (!(await this.vocabsService.existVocabById(vocabId))) {
        throw new NotFoundException('NotFound Vocab');
      }
      
      return await this.vocabsService.createReviewVocab(req.user.id, vocabId, level)
    }

    @Put('reviewquiz/:reviewvocabId')
    @ApiOperation({
      summary: '사용자 review quiz단어 완료',
      description: 'complete을 false => true로 업데이트'
    })
    @ApiOkResponse({
      status: 200,
      type: ReviewVocabResultDto,
    })
    async updateUserReviewVocab(
      @Request() req,
      @Param('reviewvocabId') reviewvocabId: string)
      : Promise<ReviewVocabResultDto>
      {
        if (!(await this.vocabsService.existReviewVocabById(req.user.id, reviewvocabId))) {
          throw new NotFoundException('NotFound ReviewVocab');
        }
        return await this.vocabsService.updateReviewVocabById(req.user.id, reviewvocabId)
      }

    @Get('reviewquiz/:userId')
    @ApiOperation({
      summary: '사용자 review quiz 단어 목록 조회',
      description: 'total: 남은 갯수, completed: 완료한 갯수',
    })
    @ApiOkResponsePaginated(ReviewVocabDto)
    async getListUserReviewVocab(
      @Request() req,
      @Param('userId') userId: string) {
      if (req.user.id != userId) {
        throw new NotFoundException('NotFound User');
      }
      return await this.vocabsService.getPagingReviewVocabs(userId)
    }
}
