import { ArrayNotEmpty, IsNotEmpty, IsString } from 'class-validator';

export class FilesToBucketDto {
  @ArrayNotEmpty()
  // local relative paths
  paths: string[];

  @IsString()
  @IsNotEmpty()
  bucket: string;
}
