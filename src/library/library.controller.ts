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
import { LibraryDto, ListLevelLibraryDto } from './dto/library.dto';
import { GetListUserLibraryDto } from './dto/get-library.dto'
import { LibraryService } from './library.service';

@Controller('library')
@ApiTags('library')
@ApiBearerAuth()
export class LibraryController {
  constructor(private readonly libraryService: LibraryService) {}

  @Get('')
  @ApiOperation({
    summary: '사용자 라이브러리',
    description: 'level값이 0 이면 전체 레벨 조회'
  })
  @ApiOkResponsePaginated(LibraryDto)
    async getUserLibrary(@Query() query: GetListUserLibraryDto, @Request() req) {
      return await this.libraryService.GetUserLibraryById(query, req.user.id)
  }
}
