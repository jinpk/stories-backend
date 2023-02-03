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
import { ListLibraryDto } from './dto/library.dto';
import { LibraryService } from './library.service';

@Controller('library')
@ApiTags('library')
@ApiBearerAuth()
export class LibraryController {
    constructor(private readonly libraryService: LibraryService) {}

    @Get('progress')
    @ApiOperation({
      summary: '사용자 레벨 라이브러리',
    })
  @ApiOkResponsePaginated(ListLibraryDto)
    async getLevelProgress(@Param('userId') userId: string) {
    }
}
