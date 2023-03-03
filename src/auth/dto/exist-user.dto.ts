import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { ExistQueryFields } from '../enums';

export class ExistUserDto {
  @ApiProperty({
    description: '조회 대상',
    enum: ExistQueryFields,
  })
  @IsNotEmpty()
  @IsEnum(ExistQueryFields)
  readonly field: string;

  @ApiProperty({
    description: '조회 대상 검색값',
  })
  @IsNotEmpty()
  readonly value: string;
}
