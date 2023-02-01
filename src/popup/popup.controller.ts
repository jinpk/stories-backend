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
import { PopupDto } from './dto/popup.dto';
import { GetPopupDto } from './dto/get-popup.dto';
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
    async createPopup() {}

    @Patch(':popup_id')
    @ApiOperation({
      summary: '(ADMIN) 팝업 수정',
    })
    @ApiBody({ type: PopupDto })
    async patchPopup(@Param('popup_id') popup_id: string) {}

    @Delete(':popup_id')
    @ApiOperation({
        summary: '(ADMIN) 팝업 삭제'
    })
    async deletePopup(@Param('popup_id') popup_id: string) {}

    @Get(':popup_id')
    @ApiOperation({
      summary: '팝업 상세 조회',
    })
    @ApiOkResponse({
      type: PopupDto,
    })
    async getPopup(@Param('popup_id') popup_id: string) {
      const popup = new PopupDto();
      return popup;
    }

    @Get('')
    @ApiOperation({
      summary: '팝업 조회',
    })
    @ApiOkResponsePaginated(PopupDto)
    async listPopup(@Query() query: GetPopupDto) {
    }
}
