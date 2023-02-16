import { ApiProperty } from '@nestjs/swagger';

export class BannerDto{
    @ApiProperty({})
    active: boolean;
  
    @ApiProperty({})
    title: string;
  
    @ApiProperty({})
    startDate: Date;
  
    @ApiProperty({})
    endDate: Date;
  
    @ApiProperty({})
    imageFilePath: string;
  
    @ApiProperty({})
    link: string;

    @ApiProperty({})
    createdAt?: Date;
}
