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
import { FaqBoardDto, FaqCategoryDto } from './dto/faqboard.dto';
import { GetListFaqBoardDto, GetListFaqCategoryDto } from './dto/get-faqboard.dto';
import { FaqboardService } from './faqboard.service';
import { UpdateFaqBoardDto } from './dto/update-faqboard.dto';
import { UpdateFaqCategoryDto } from './dto/update-faqboard.dto';

@Controller('faqboard')
@ApiTags('faqboard')
@ApiBearerAuth()
export class FaqboardController {
    constructor(private readonly faqboardService: FaqboardService) {}
    @Post('')
    @ApiOperation({
      summary: '(ADMIN) FAQ 등록',
    })
    @ApiBody({ type: FaqBoardDto })
    @ApiOkResponse({
      status: 200,
      type: String,
    })
    async saveFaq(@Body() body, @Request() req) {
      if (!req.user.isAdmin) {
        throw new UnauthorizedException('Not an Admin')
      }
      return await this.faqboardService.createFaq(body)
    }

    @Put(':faqId')
    @ApiOperation({
      summary: '(ADMIN) FAQ 수정',
    })
    @ApiBody({ type: UpdateFaqBoardDto })
    @ApiOkResponse({
      status: 200,
      type: String,
    })
    async updateFaq(
      @Param('faqId') faqId: string,
      @Body() body,
      @Request() req) {
        if (!req.user.isAdmin) {
          throw new UnauthorizedException('Not an Admin')
        }
        if (!(await this.faqboardService.existFaqById(faqId))) {
          throw new NotFoundException('NotFound FaQ');
        }
        return await this.faqboardService.updateFaq(faqId, body);
      }

    @Delete(':faqId')
    @ApiOperation({
        summary: '(ADMIN) FAQ 삭제'
    })
    @ApiOkResponse({
      status: 200,
      type: String,
    })
    async deleteFaq(@Param('faqId') faqId: string, @Request() req) {
      if (!req.user.isAdmin) {
        throw new UnauthorizedException('Not an Admin')
      }
      if (!(await this.faqboardService.existFaqById(faqId))) {
        throw new NotFoundException('NotFound Banner');
      }
      return await this.faqboardService.deleteFaq(faqId);
    }

    @Get('faq/:faqId')
    @ApiOperation({
      summary: 'FAQ 상세 조회',
    })
    @ApiOkResponse({
      type: FaqBoardDto,
    })
    async getFaq(@Param('faqId') faqId: string) {
      if (!(await this.faqboardService.existFaqById(faqId))) {
        throw new NotFoundException('NotFound FaQ');
      }
      return await this.faqboardService.GetFaqById(faqId);;
    }

    @Get('')
    @ApiOperation({
      summary: 'FAQ 리스트 조회',
    })
    @ApiOkResponsePaginated(FaqBoardDto)
    async listFaq(@Query() query: GetListFaqBoardDto) {
      return await this.faqboardService.getPagingFaqs(query)
    }

    @Post('category')
    @ApiOperation({
      summary: '(ADMIN) FAQ 카테고리 등록',
    })
    @ApiBody({ type: FaqCategoryDto })
    @ApiOkResponse({
      status: 200,
      type: String,
    })
    async saveFaqCategory(
      @Body() body,
      @Request() req) {
        if (!req.user.isAdmin) {
          throw new UnauthorizedException('Not an Admin')
        }
        return await this.faqboardService.createFaqCategory(body)
    }

    @Put('category/:faqCategoryId')
    @ApiOperation({
      summary: '(ADMIN) FAQ 카테고리 수정',
    })
    @ApiBody({ type: UpdateFaqCategoryDto })
    @ApiOkResponse({
      status: 200,
      type: String,
    })
    async updateFaqCategory(
      @Param('faqCategoryId') faqCategoryId: string,
      @Body() body,
      @Request() req) {
        if (!req.user.isAdmin) {
          throw new UnauthorizedException('Not an Admin')
        }
        if (!(await this.faqboardService.existFaqCategoryById(faqCategoryId))) {
          throw new NotFoundException('NotFound Category');
        }
        return await this.faqboardService.updateFaqCategory(faqCategoryId, body);
    }

    @Delete('category/:faqCategoryId')
    @ApiOperation({
      summary: '(ADMIN) FAQ 카테고리 삭제',
    })
    async deleteFaqCategory(
      @Param('faqCategoryId') faqCategoryId: string,
      @Request() req) {
        if (!req.user.isAdmin) {
          throw new UnauthorizedException('Not an Admin')
        }
        if (!(await this.faqboardService.existFaqCategoryById(faqCategoryId))) {
          throw new NotFoundException('NotFound Category');
        }
        return await this.faqboardService.deleteFaqCategory(faqCategoryId);
    }

    @Get('category')
    @ApiOperation({
      summary: '카테고리 리스트 조회',
    })
    @ApiOkResponsePaginated(FaqCategoryDto)
    async listFaqCategory(@Query() query: GetListFaqCategoryDto) {
      return await this.faqboardService.getPagingFaqCategory(query)
    }
}
