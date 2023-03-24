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
import { EduStatusDto, Statics, Completed, CertificateDto } from './dto/edustatus.dto';
import { ReadStoryDto } from './dto/readstory.dto';
import { GetReadStoryDto } from './dto/get-readstory.dto';
import { UpdateEduStatusDto, UpdateEduCompleted } from './dto/update-edustatus.dto';
import { EdustatusService } from './edustatus.service';
import { query } from 'express';
  
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
        description: 'When user read one content, put one contentId in array. or send empty array.'
    })
    @ApiBody({
        type:UpdateEduCompleted,
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
            return await this.edustatusService.updateUserCompleted(req.user.id, body);
    }

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
        console.log(req.user.id)
        return await this.edustatusService.getEduStatusById(req.user.id);
        
    }

    @Get('certificates/me')
    @ApiOperation({
        summary: '사용자 레벨별 수료현황-마이페이지',
    })
    @ApiOkResponse({
        status: 200,
        type: [CertificateDto],
    })
    async getUserCretificate(@Request() req) {
        return await this.edustatusService.getUserCertificates(req.user.id);
    }

    @Get('studied/me')
    @ApiOperation({
        summary: '사용자별 학습날짜-마이페이지',
    })
    @ApiOkResponse({
        status: 200,
        type: [ReadStoryDto],
    })
    async getUserStudied(@Request() req, @Query() query: GetReadStoryDto) {
        return await this.edustatusService.getStudiedDates(req.user.id, query);
    }
}
