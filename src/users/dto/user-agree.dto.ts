import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsNotEmpty } from 'class-validator';
import { UserAgreeTypes } from '../enums';

export class UserAgreeDto {
  @ApiProperty({ description: '약관 유형', enum: UserAgreeTypes })
  @IsEnum(UserAgreeTypes)
  type: UserAgreeTypes;

  @ApiProperty({ description: '동의 여부' })
  @IsBoolean()
  agreed: boolean;
}

export class UserAgreeUpdateDto {
  @ApiProperty({ description: '동의 여부' })
  @IsBoolean()
  @IsNotEmpty()
  agreed: boolean;
}
