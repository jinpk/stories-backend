import { ApiProperty } from '@nestjs/swagger';

export class PopupSize {
    @ApiProperty({})
    width: number;

    @ApiProperty({})
    hieght: number;
}

export class PopupLink {
    @ApiProperty({})
    external: string;

    @ApiProperty({})
    internal: string;
}

export class PopupDto{
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
  
    @ApiProperty({})
    size: PopupSize;
  
    @ApiProperty({})
    link: PopupLink;

    @ApiProperty({})
    createdAt?: Date;
  }
