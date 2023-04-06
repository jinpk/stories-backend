import { ApiProperty, IntersectionType } from '@nestjs/swagger';
import { DateReqDto } from 'src/common/dto/request.dto';

export class GetCertificateDetailDto {
    @ApiProperty({})
    level: string
}