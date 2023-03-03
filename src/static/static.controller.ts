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
import { GetContentsCompleteDto, GetVocabQuizDto, GetLevelTestResultDto } from './dto/get-static.dto';
import { StaticService } from './static.service';

@Controller('static')
@ApiTags('static')
@ApiBearerAuth()
export class StaticController {
    constructor(private readonly staticService: StaticService) {}
    @Get('contentscomplete')
    @ApiOperation({
        summary: '(ADMIN) 레벨별 콘텐츠 complete율',
    })
    async getContentsComplete(
        @Query() query: GetContentsCompleteDto,
        @Request() req) {
        if (!req.user.isAdmin) {
            throw new UnauthorizedException('Not an Admin')
        }
        await this.staticService.getContentsCompleteStatic(query);
    }

    @Get('vocabquiz')
    @ApiOperation({
        summary: '(ADMIN) Vocab 퀴즈 이용 통계',
    })
    async getVocabQuiz(
        @Query() query: GetVocabQuizDto,
        @Request() req) {
        if (!req.user.isAdmin) {
            throw new UnauthorizedException('Not an Admin')
        }
        return await this.staticService.getVocabQuizStatic(query);
    }

    @Get('leveltest')
    @ApiOperation({
        summary: '(ADMIN) 레벨테스트 결과 분포',
    })
    async getLevelTestResult(
        @Query() query: GetLevelTestResultDto,
        @Request() req) {
        if (!req.user.isAdmin) {
            throw new UnauthorizedException('Not an Admin')
        }
        return await this.staticService.getLevelTestStatic(query);
    }
}
