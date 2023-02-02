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
import { LevelTestDto, LevelTestResultDto } from './dto/leveltest.dto';
import { GetLevelTestsDto, GetStaticsLevelTestDto } from './dto/get-leveltest.dto';
import { StaticsLevelTestDto } from './dto/leveltest-statics.dto';
import { LeveltestService } from './leveltest.service';

@Controller('leveltest')
@ApiTags('leveltest')
@ApiBearerAuth()
export class LeveltestController {
    constructor(private readonly leveltestService: LeveltestService) {}
    @Post('')
    @ApiOperation({
      summary: '(ADMIN) 레벨 테스트 등록',
    })
    @ApiBody({ type: LevelTestDto })
    async createLevelTest() {}

    @Patch(':leveltest_id')
    @ApiOperation({
      summary: '(ADMIN) 레벨 테스트 수정',
    })
    @ApiBody({ type: LevelTestDto })
    async patchLevelTest(@Param('leveltest_id') leveltest_id: string) {}

    @Delete(':leveltest_id')
    @ApiOperation({
        summary: '레벨 테스트 삭제'
    })
    async deleteLevelTest(@Param('leveltest_id') leveltest_id: string) {}

    @Get('statics')
    @ApiOperation({
      summary: '(ADMIN) leveltest 이용 통계',
    })
    @ApiOkResponsePaginated(StaticsLevelTestDto)
    async getStaticsLevelTest(@Query() qeury: GetStaticsLevelTestDto) {}

    @Post('result/:user_id')
    @ApiOperation({
      summary: '사용자 레벨 테스트 최종결과 등록',
    })
    @ApiBody({ type: LevelTestResultDto })
    async saveLevelTestResult(@Param('user_id') user_id: string) {}

    @Get(':leveltest_id')
    @ApiOperation({
      summary: '레벨테스트 상세 조회',
    })
    @ApiOkResponse({
      type: LevelTestDto,
    })
    async getLevelTest(@Param('leveltest_id') leveltest_id: string) {
      const leveltest = new LevelTestDto();
      return leveltest;
    }

    @Get('')
    @ApiOperation({
      summary: '레벨테스트 조회',
    })
    @ApiOkResponsePaginated(LevelTestDto)
    async listLevelTest(@Query() query: GetLevelTestsDto) {
    }
}
