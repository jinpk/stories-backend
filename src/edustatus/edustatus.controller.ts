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
import { EduStatusDto, Statics, LevelCompleted, LevelTestResultDto } from './dto/edustatus.dto';
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
        status: 200,
        type: EduStatusDto,
    })
    async getUserEduInfo(
        @Param('userId') userId: string,
        @Request() req) {
        if (!req.user.isAdmin) {
            throw new UnauthorizedException('Not an Admin')
        }
        if (!(await this.edustatusService.existEdustatus(userId))) {
            throw new NotFoundException('NotFound Edustatus');
        }
        return await this.edustatusService.getEduStatusById(userId); 
    }

    @Put('static')
    @ApiOperation({
        summary: '사용자 학습 통계지표 업데이트',
    })
    @ApiBody({
        type: Statics
    })
    @ApiOkResponse({
        status: 200,
        type: String,
    })
    async updateEduStatics(
        @Body() body,
        @Request() req) {
            if (!(await this.edustatusService.existEdustatus(req.user.id))) {
                throw new NotFoundException('NotFound Edustatus');
            }
            return await this.edustatusService.updateUserEduStatic(req.user.id, body);
    }

    @Put('level')
    @ApiOperation({
        summary: '사용자 레벨별 진행현황 업데이트',
    })
    @ApiBody({
        type:[LevelCompleted],
    })
    @ApiOkResponse({
        status: 200,
        type: String,
    })
    async updateEduLevel(
        @Body() body,
        @Request() req){
            if (!(await this.edustatusService.existEdustatus(req.user.id))) {
                throw new NotFoundException('NotFound Edustatus');
            }
            return await this.edustatusService.updateUserEduLevel(req.user.id, body);
    }

    @Post('leveltest')
    @ApiOperation({
      summary: '사용자 최초 레벨 테스트 결과 제출',
    })
    @ApiBody({ type: LevelTestResultDto })
    @ApiOkResponse({
        status: 200,
        type: String,
    })
    async saveLevelTestResult(@Request() req,@Body() body) {
        if (!(await this.edustatusService.existEdustatus(req.user.id))) {
            return await this.edustatusService.createEduStatus(req.user.id, body)
        } else {
            return '이미 존재하는 user_id 입니다.'
        }
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

    @Get('me')
    @ApiOperation({
        summary: 'HOME 사용자 학습 진행상황',
    })
    @ApiOkResponse({
        status: 200,
        type: EduStatusDto,
    })
    async getEduStatus(@Request() req) {
        if (!(await this.edustatusService.existEdustatus(req.user.id))) {
            throw new NotFoundException('NotFound Edustatus');
        }
        return await this.edustatusService.getEduStatusById(req.user.id);
        
    }

    @Get('certificates/me')
    @ApiOperation({
        summary: '사용자 레벨별 수료현황-마이페이지',
    })
    @ApiOkResponse({
        status: 200,
        type: EduStatusDto,
    })
    async getUserCretificate(@Request() req) {
        return await this.edustatusService.getUserCertificates(req.user.id);
        
    }
}
