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
import { BannerDto } from './dto/banner.dto';
import { GetBannerDto } from './dto/get-banner.dto';
import { BannerService } from './banner.service';

@Controller('banner')
@ApiTags('banner')
@ApiBearerAuth()
export class BannerController {
    constructor(private readonly bannerService: BannerService) {}
    @Post('')
    @ApiOperation({
      summary: '(ADMIN) 배너 등록',
    })
    @ApiBody({ type: BannerDto })
    async createBanner() {}

    @Patch(':banner_id')
    @ApiOperation({
      summary: '(ADMIN) 배너 수정',
    })
    @ApiBody({ type: BannerDto })
    async patchBanner(@Param('banner_id') banner_id: string) {}

    @Delete(':banner_id')
    @ApiOperation({
        summary: '(ADMIN) 배너 삭제'
    })
    async deleteBanner(@Param('banner_id') banner_id: string) {}

    @Get(':banner_id')
    @ApiOperation({
      summary: '배너 상세 조회',
    })
    @ApiOkResponse({
      type: BannerDto,
    })
    async getBanner(@Param('banner_id') banner_id: string) {
      const banner = new BannerDto();
      return banner;
    }

    @Get('')
    @ApiOperation({
      summary: '배너 조회',
    })
    @ApiOkResponsePaginated(BannerDto)
    async listBanner(@Query() query: GetBannerDto) {
    }
}
