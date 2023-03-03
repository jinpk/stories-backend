import { ApiProperty, IntersectionType } from '@nestjs/swagger';
import { PagingExcelDateReqDto, DateReqDto } from 'src/common/dto/request.dto';

export class GetContentsCompleteDto extends PagingExcelDateReqDto {
}

export class GetVocabQuizDto extends PagingExcelDateReqDto {
}

export class GetLevelTestResultDto extends PagingExcelDateReqDto {
}