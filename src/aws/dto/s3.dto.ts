import { ArrayNotEmpty, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class FilesToBucketDto {
  @ArrayNotEmpty()
  // local relative paths
  paths: string[];

  @IsString()
  @IsNotEmpty()
  bucket: string;
}

export class FilesFromBucketDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  // local relative paths
  path: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  bucket: string;
}