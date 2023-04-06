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
import { EduStatusDto, CertificateDto, HomeInfoDto, CertificateDetailDto } from './dto/edustatus.dto';
import { ReadStoryDto } from './dto/readstory.dto';
import { GetReadStoryDto } from './dto/get-readstory.dto';
import { UpdateEduStatusDto, UpdateEduCompleted } from './dto/update-edustatus.dto';
import { EdustatusService } from './edustatus.service';
import { query } from 'express';
import { GetCertificateDetailDto } from './dto/get-edustatus.dto';
  
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

    @Put('level')
    @ApiOperation({
        summary: '사용자 레벨별 진행현황 업데이트',
        description: 'When user read one content, put one contentId and serialnum'
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
        description: 'When user read one content, put one contentId and serialnum'
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
    async getUserStudied(@Request() req, @Query() query: GetReadStoryDto) {
        return await this.edustatusService.getStudiedDates(req.user.id, query);
    }
}