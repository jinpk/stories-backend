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
import { LevelTestDto, LevelTestResultDto } from './dto/leveltest.dto';
import { UpdateLevelTestDto } from './dto/update-leveltest.dto';
import { GetPagingLevelTestDto, GetStaticsLevelTestDto } from './dto/get-leveltest.dto';
import { LeveltestService } from './leveltest.service';

@Controller('leveltest')
@ApiTags('leveltest')
@ApiBearerAuth()
export class LeveltestController {
  constructor(private readonly leveltestService: LeveltestService) {}
  @Post('')
  @ApiOperation({
    summary: '(ADMIN) 레벨 테스트 문제 등록',
  })
  @ApiBody({ type: LevelTestDto })
  async createLevelTest(@Body() body: LevelTestDto, @Request() req) {
    if (!req.user.isAdmin) {
      throw new UnauthorizedException('not an Admin')
    }
    return await this.leveltestService.createLevelTest(body)
  }

  @Put(':leveltestId')
  @ApiOperation({
    summary: '(ADMIN) 레벨 테스트 문제 수정',
  })
  @ApiBody({ type: UpdateLevelTestDto })
  @ApiOkResponse({
    status: 200,
    type: String,
  })
  async patchLevelTest(
    @Param('leveltestId') leveltestId: string,
    @Body() body: UpdateLevelTestDto,
    @Request() req) {
      if (!req.user.isAdmin) {
        throw new UnauthorizedException('not an Admin')
      }
      if (!(await this.leveltestService.existLevelTestById(leveltestId))) {
        throw new NotFoundException('NotFound LevelTest');
      }
      return await this.leveltestService.updateLevelTestById(leveltestId, body)
  }

  @Delete(':leveltestId')
  @ApiOperation({
      summary: '(ADMIN) 레벨 테스트 문제 삭제'
  })
  @ApiOkResponse({
    status: 200,
    type: String,
  })
  async deleteLevelTest(@Param('leveltestId') leveltestId: string, @Request() req) {
    if (!req.user.isAdmin) {
      throw new UnauthorizedException('not an Admin')
    }
    if (!(await this.leveltestService.existLevelTestById(leveltestId))) {
      throw new NotFoundException('NotFound LevelTest');
    }
    return await this.leveltestService.deleteLevelTest(leveltestId)
  }

  @Get(':leveltestId')
  @ApiOperation({
    summary: '레벨테스트 문제 상세 조회',
  })
  @ApiOkResponse({
    status: 200,
    type: LevelTestDto,
  })
  async getLevelTest(@Param('leveltestId') leveltestId: string) {
    if (!(await this.leveltestService.existLevelTestById(leveltestId))) {
      throw new NotFoundException('NotFound LevelTest');
    }
    return await this.leveltestService.getLevelTestById(leveltestId);
  }

  @Get('')
  @ApiOperation({
    summary: '레벨테스트 문제 목록 조회',
    description: "step: 빈값일 경우 전체조회. 특정 step 입력하여 조회."
  })
  @ApiOkResponsePaginated(LevelTestDto)
  async listLevelTest(@Query() query: GetPagingLevelTestDto) {
    return await this.leveltestService.getPagingLevelTestsByLevel(query);
  }

  @Post('leveltest')
  @ApiOperation({
    summary: '사용자 레벨 테스트 결과 제출',
  })
  @ApiBody({ type: LevelTestResultDto })
  @ApiOkResponse({
      status: 200,
      type: String,
  })
  async saveLevelTestResult(@Request() req,@Body() body) {
      return await this.leveltestService.postLevelTest(req.user.id, body)
  }
}
