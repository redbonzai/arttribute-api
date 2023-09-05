import { IsNotEmpty, IsString } from 'class-validator';

export class KeyDto {
  @IsNotEmpty()
  @IsString()
  id: string;

  @IsString()
  @IsNotEmpty()
  project: string;

  @IsNotEmpty()
  @IsString()
  prefix: string;

  @IsNotEmpty()
  @IsString()
  value: string;
}

