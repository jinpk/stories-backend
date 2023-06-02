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
import { 
    EduStatusDto,
    CertificateDto,
    HomeInfoDto, 
    CertificateDetailDto,
    EduInfoDto,
} from './dto/edustatus.dto';
import { ReadStoryDto } from './dto/readstory.dto';
import {
    UpdateEduCompleted,
    ChangeSelectedLevelDto
} from './dto/update-edustatus.dto';
import { EdustatusService } from './edustatus.service';
import { QuizResultDto } from './dto/quizresult.dto';
import { GetStudiedDateDto } from './dto/get-edustatus.dto';
  
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
        type: EduInfoDto,
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
        return await this.edustatusService.getUserEduInfoById(userId); 
    }

    @Post('readcontents')
    @ApiOperation({
        summary: 'User complete read content',
        description: 'When user start read one content, send completed = false'
    })
    @ApiBody({
        type:UpdateEduCompleted,
    })
    @ApiOkResponse({
        status: 200,
        type: String,
    })
    async patchupdateEduLevel(
        @Body() body,
        @Request() req){
            if (!(await this.edustatusService.existEdustatus(req.user.id))) {
                throw new NotFoundException('NotFound Edustatus');
            }
            return await this.edustatusService.updateUserCompleted(req.user.id, body);
    }

    @Put('changelevel')
    @ApiOperation({
        summary: 'Change selectedLevel',
    })
    @ApiOkResponse({
        status: 200,
        type: EduStatusDto,
    })
    async updateEduLevel(
        @Body() body: ChangeSelectedLevelDto,
        @Request() req){
            if (!(await this.edustatusService.existEdustatus(req.user.id))) {
                throw new NotFoundException('NotFound Edustatus');
            }
            return await this.edustatusService.changeSelectedLevel(req.user.id, body.level);
    }

    @Get('me')
    @ApiOperation({
        summary: 'Home Screen: User education info',
        description: 'get user education info',
    })
    @ApiOkResponse({
        status: 200,
        type: HomeInfoDto,
    })
    async getEduStatus(@Request() req) {
        if (!(await this.edustatusService.existEdustatus(req.user.id))) {
            throw new NotFoundException('NotFound Edustatus');
        }

        return await this.edustatusService.getHomeinfoByUserId(req.user.id);
        
    }

    @Get('certificates/me')
    @ApiOperation({
        summary: 'user certification list',
    })
    @ApiOkResponse({
        status: 200,
        type: [CertificateDto],
    })
    async getUserCertificate(@Request() req) {
        return await this.edustatusService.getUserCertificates(req.user.id);
    }

    @Get('certificates/me/detail')
    @ApiOperation({
        summary: 'user certification detail by level',
    })
    @ApiOkResponse({
        status: 200,
        type: CertificateDetailDto,
    })
    async getUserCertificateDetail(
        @Query('level') query: string,
        @Request() req) {
        return await this.edustatusService.getUserCertificateDetail(req.user.id, query);
    }

    @Get('studied/me')
    @ApiOperation({
        summary: '사용자별 학습날짜-마이페이지',
    })
    @ApiOkResponse({
        status: 200,
        type: [ReadStoryDto],
    })
    async getUserStudied(@Request() req, @Query() query: GetStudiedDateDto) {
        return await this.edustatusService.getStudiedDates(req.user.id, query);
    }

    @Post('quizresult')
    @ApiOperation({
        summary: 'Post each quiz result',
    })
    @ApiBody({
        type: QuizResultDto,
    })
    @ApiOkResponse({
        status: 200,
        type: String,
    })
    async putquizResult(
        @Body() body,
        @Request() req){
            if (!(await this.edustatusService.existEdustatus(req.user.id))) {
                throw new NotFoundException('NotFound Edustatus');
            }
            return await this.edustatusService.createQuizResult(req.user.id, body);
    }

    @Get('quizresult')
    @ApiOperation({
        summary: '사용자별 퀴즈 총갯수, 정답갯수, 정답률',
    })
    @ApiOkResponse({
        status: 200,
    })
    async getUserQuizResult(@Request() req) {
        return await this.edustatusService.getQuizCorrectResult(req.user.id);
    }
}