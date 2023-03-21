import {
    Controller,
    Get,
    Param,
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
import { AudioPlayerDto } from './dto/audioplayer.dto';
import { GetListAudioPlayerDto } from './dto/get-audioplayer.dto';
import { AudioplayerService } from './audioplayer.service';

@Controller('audioplayer')
@ApiTags('audioplayer')
@ApiBearerAuth()
export class AudioplayerController {
    constructor(private readonly audioplayerService: AudioplayerService) {}

    @Get(':contentsSerialNum')
    @ApiOperation({
      summary: 'Auioplayer 상세 조회',
    })
    @ApiOkResponse({
      type: AudioPlayerDto,
    })
    async getAudioplayer(@Param('contentsSerialNum') contentsSerialNum: string) {
      if (!(await this.audioplayerService.existBycontentsSerialNum(contentsSerialNum))) {
        throw new NotFoundException('NotFound Conetents');
      }
      return await this.audioplayerService.GetAudioPlayerBySerialNum(contentsSerialNum);;
    }

    // 사용자ID, 레벨별, 북마크(선택형) 오디오 플레이어 목록
    @Get('')
    @ApiOperation({
      summary: 'AudioPlayer 리스트 조회',
    })
    @ApiOkResponsePaginated(AudioPlayerDto)
    async listAudioplayer(
      @Query() query: GetListAudioPlayerDto,
      @Request() req) {
      return await this.audioplayerService.getPagingAudioPlayers(query, req.user.id);
    }
}
