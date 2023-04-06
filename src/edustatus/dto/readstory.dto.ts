import { ApiProperty } from '@nestjs/swagger';
import { now } from 'mongoose';

export class ReadStoryDto {
    id: string;

    @ApiProperty()
    userId: string;

    @ApiProperty()
    level: string;

    @ApiProperty()
    eduContentsId: string;

    @ApiProperty()
    contentsSerialNum: string;

    @ApiProperty()
    lastReadAt: Date;

    @ApiProperty()
    completed?: boolean;

    @ApiProperty()
    completedAt?: Date;

    @ApiProperty({})
    createdAt?: Date;

    @ApiProperty({})
    updatedAt?: Date;
}