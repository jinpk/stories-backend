import { Controller, Get, Post, Param, Body, UseInterceptors } from '@nestjs/common';
import { VocabDto } from './dto/vocab.dto';

import {
    ApiBearerAuth,
    ApiOkResponse,
    ApiOperation,
    ApiTags,
} from '@nestjs/swagger'
import { VocabsService } from './vocabs.service';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('vocabs')
@ApiTags('vocabs')
@ApiBearerAuth()
export class VocabsController {
    constructor(private readonly vocabsService: VocabsService) {}

    // @Get('cats/all')
    // async findAll(): string {
    //   return 'This action returns all cats';
    // }
  
    // @Get(':id')
    // findOne(@Param('id') id: number): string {
    //     console.log(id)
    //   return 'This action returns one cats';
    // }
  
    @Get(':id')
    @ApiOperation({
      summary: 'Vocab 상세 조회',
    })
    @ApiOkResponse({
      type: VocabDto,
    })
    async getVocab(@Param('vocab_id') vocab_id: string) {
      const vocab = new VocabDto();
      return vocab;
    }

    @Get('listvocab')
    async getListVocab() {
      return 'This action returns some list vocab';
    }

    @Post('fileupload')
    @ApiOperation({
      summary: 'Vocab Excel File 업로드',
    })
    @UseInterceptors(FileInterceptor('excel_file', 1, ))
    fileUpload(@Body('excel_data') excel_data: FormData) {
      return 'This action POST vocabs by reading excel data';
    }
}
