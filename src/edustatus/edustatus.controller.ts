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
import { EduStatusDto } from './dto/edustatus.dto';
import { EdustatusService } from './edustatus.service';
  
@Controller('edustatus')
@ApiTags('edustatus')
@ApiBearerAuth()
export class EdustatusController {
    constructor(private readonly edustatusService: EdustatusService) {}
    @Get('userstatus/:userId')
    @ApiOperation({
        summary: '(ADMIN) 회원상세 학습정보',
    })
    @ApiOkResponse({
        type: EduStatusDto,
    })
    async getUserEduInfo(
        @Param('userId') userId: string,
        @Request() req) {
        if (!req.user.isAdmin) {
            throw new UnauthorizedException('Not an Admin')
        }
        return await this.edustatusService.getEduStatusById(userId); 
    }

    // @Post('result')
    // @ApiOperation({
    //   summary: '사용자 학습컨텐츠 퀴즈 결과 제출',
    // })
    // @ApiBody({ type: GetContentsQuizResultDto })
    // @ApiOkResponse({
    //   type:    ContentsQuizResultDto,
    // })
    // async saveContentsQuizResult(
    //   @Param('userId') userId: string,
    //   @Body() body,
    //   @Request() req) {
    //     return await this.edustatusService.updateEduStatus(userId, body)
    // }

    @Get(':userId')
    @ApiOperation({
        summary: 'HOME 사용자 학습 진행상황',
    })
    @ApiOkResponse({
        type: EduStatusDto,
    })
    async getEduStatus(
        @Param('userId') userId: string,
        @Request() req) {
        if (userId == req.user.id) {
            return await this.edustatusService.getEduStatusById(req.user.id);
        }
    }

    @Put('static/:userId')
    @ApiOperation({
        summary: '사용자 학습 통계지표 업데이트',
    })
    async updateEduStatics() {

    }

    @Put('level/:userId')
    @ApiOperation({
        summary: '사용자 레벨별 진행현황 업데이트',
    })
    async updateEduLevel() {

    }
}
