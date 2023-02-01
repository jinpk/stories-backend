import { ApiProperty } from '@nestjs/swagger';

export class BannerDto{
    @ApiProperty({})
    active: boolean;
  
    @ApiProperty({})
    title: string;
  
    @ApiProperty({})
    startDate: string;
  
    @ApiProperty({})
    endDate: string;
  
    @ApiProperty({})
    imageFilePath: string;
  
  }
