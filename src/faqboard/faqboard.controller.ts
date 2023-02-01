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
import { FaqBoardDto, FaqCategoryDto } from './dto/faqboard.dto';
import { GetFaqBoardDto } from './dto/get-faqboard.dto';
import { FaqboardService } from './faqboard.service';
  
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
    async createFaq() {}

    @Patch(':faq_id')
    @ApiOperation({
      summary: '(ADMIN) FAQ 수정',
    })
    @ApiBody({ type: FaqBoardDto })
    async patchFaq(@Param('faq_id') faq_id: string) {}

    @Delete(':faq_id')
    @ApiOperation({
        summary: '(ADMIN) FAQ 삭제'
    })
    async deleteFaq(@Param('faq_id') faq_id: string) {}

    @Post('')
    @ApiOperation({
      summary: '(ADMIN) FAQ 카테고리 등록',
    })
    async createFaqCategory(@Param('category') category: string) {}

    @Patch(':faq_category_id')
    @ApiOperation({
      summary: '(ADMIN) FAQ 카테고리 수정',
    })
    async patchFaqCategory(@Param('faq_category_id') faq_category_id: string, @Param('category') category: string) {}

    @Delete('')
    @ApiOperation({
      summary: '(ADMIN) FAQ 카테고리 삭제',
    })
    @ApiBody({ type: FaqBoardDto })
    async deleteFaqCategory() {}

    @Get(':faq_id')
    @ApiOperation({
      summary: 'FAQ 상세 조회',
    })
    @ApiOkResponse({
      type: FaqBoardDto,
    })
    async getFaq(@Param('faq_id') faq_id: string) {
      const faq = new FaqBoardDto();
      return faq;
    }

    @Get('')
    @ApiOperation({
      summary: 'FAQ 조회',
    })
    @ApiOkResponsePaginated(FaqBoardDto)
    async listFaq(@Query() query: GetFaqBoardDto) {
    }

    @Get('')
    @ApiOperation({
      summary: '카테고리 조회',
    })
    @ApiOkResponsePaginated(FaqCategoryDto)
    async listFaqCategory() {
    }
}
