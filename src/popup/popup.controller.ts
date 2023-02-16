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
import { PopupDto } from './dto/popup.dto';
import { GetListPopupDto } from './dto/get-popup.dto';
import { PopupService } from './popup.service';

@Controller('popup')
@ApiTags('popup')
@ApiBearerAuth()
export class PopupController {
    constructor(private readonly popupService: PopupService) {}
    @Post('')
    @ApiOperation({
      summary: '(ADMIN) 팝업 등록',
    })
    @ApiBody({ type: PopupDto })
    @ApiOkResponse({
      status: 200,
      type: String,
    })
    async savePopup(@Body() body, @Request() req) {
      if (!req.user.isAdmin) {
        throw new UnauthorizedException('Not an Admin')
      }
      return await this.popupService.createPopup(body)
    }

    @Put(':popupId')
    @ApiOperation({
      summary: '(ADMIN) 팝업 수정',
    })
    @ApiBody({ type: PopupDto })
    @ApiOkResponse({
      status: 200,
      type: String,
    })
    async patchPopup(
      @Param('popupId') popupId: string,
      @Body() body,
      @Request() req) {
        if (!req.user.isAdmin) {
          throw new UnauthorizedException('Not an Admin')
        }
        if (!(await this.popupService.existPopup(popupId))) {
          throw new NotFoundException('NotFound Popup');
        }
        return await this.popupService.updatePopup(popupId, body);
    }

    @Delete(':popupId')
    @ApiOperation({
        summary: '(ADMIN) 팝업 삭제'
    })
    @ApiOkResponse({
      status: 200,
      type: String,
    })
    async deletePopup(@Param('popupId') popupId: string, @Request() req) {
      if (!req.user.isAdmin) {
        throw new UnauthorizedException('Not an Admin')
      }
      if (!(await this.popupService.existPopup(popupId))) {
        throw new NotFoundException('NotFound Popup');
      }
      return await this.popupService.deletePopup(popupId);
    }

    @Get(':popupId')
    @ApiOperation({
      summary: '팝업 상세 조회',
    })
    @ApiOkResponse({
      status: 200,
      type: PopupDto,
    })
    async getPopup(@Param('popupId') popupId: string) {
      if (!(await this.popupService.existPopup(popupId))) {
        throw new NotFoundException('NotFound Popup');
      }
      return await this.popupService.getPopupById(popupId);
    }

    @Get('list')
    @ApiOperation({
      summary: '팝업 조회',
    })
    @ApiOkResponsePaginated(PopupDto)
    async listPopup(@Query() query: GetListPopupDto) {
      return await this.popupService.getPagingPopups(query)
    }
}
