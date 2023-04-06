import { ApiProperty } from '@nestjs/swagger';
import { now } from 'mongoose';

export class ReadStoryDto {
    @ApiProperty()
    userId: string;

    @ApiProperty()
    eduContentsId: string;

    @ApiProperty()
    contentsSerialNum: string;

    @ApiProperty({})
    createdAt?: Date;

    @ApiProperty({})
    updatedAt?: Date;
}