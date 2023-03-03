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
import { BannerDto } from './dto/banner.dto';
import { GetListBannerDto } from './dto/get-banner.dto';
import { UpdateBannerDto } from './dto/update-banner.dto';
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
    @ApiOkResponse({
      status: 200,
      type: String,
    })
    async saveBanner(@Body() body, @Request() req) {
      if (!req.user.isAdmin) {
        throw new UnauthorizedException('Not an Admin')
      }
      return await this.bannerService.createBanner(body)
    }

    @Put(':bannerId')
    @ApiOperation({
      summary: '(ADMIN) 배너 수정',
    })
    @ApiBody({ type: UpdateBannerDto })
    @ApiOkResponse({
      status: 200,
      type: String,
    })
    async updateBanner(
      @Param('bannerId') bannerId: string,
      @Body() body,
      @Request() req) {
        if (!req.user.isAdmin) {
          throw new UnauthorizedException('Not an Admin')
        }
        if (!(await this.bannerService.existBanner(bannerId))) {
          throw new NotFoundException('NotFound Banner');
        }
        return await this.bannerService.updateBanner(bannerId, body);
    }

    @Delete(':bannerId')
    @ApiOperation({
        summary: '(ADMIN) 배너 삭제'
    })
    @ApiOkResponse({
      status: 200,
      type: String,
    })
    async deleteBanner(@Param('bannerId') bannerId: string, @Request() req) {
      if (!req.user.isAdmin) {
        throw new UnauthorizedException('Not an Admin')
      }
      if (!(await this.bannerService.existBanner(bannerId))) {
        throw new NotFoundException('NotFound Banner');
      }
      return await this.bannerService.deleteBanner(bannerId);
    }

    @Get(':bannerId')
    @ApiOperation({
      summary: '배너 상세 조회',
    })
    @ApiOkResponse({
      status: 200,
      type: BannerDto,
    })
    async getBanner(@Param('bannerId') bannerId: string) {
      if (!(await this.bannerService.existBanner(bannerId))) {
        throw new NotFoundException('NotFound Banner');
      }
      return await this.bannerService.getBannerById(bannerId);
    }

    @Get('')
    @ApiOperation({
      summary: '배너 라스트 조회',
    })
    @ApiOkResponsePaginated(BannerDto)
    async listBanner(@Query() query: GetListBannerDto) {
      return await this.bannerService.getPagingBanners(query)
    }
}
