import { IsNotEmpty, IsString } from 'class-validator';

export class KeyDto {
  @IsNotEmpty()
  @IsString()
  id: string;

  @IsString()
  @IsNotEmpty()
  owner: string;

  @IsNotEmpty()
  @IsString()
  prefix: string;

  @IsNotEmpty()
  @IsString()
  value: string;

  @IsNotEmpty()
  @IsString()
  name: string;

  @IsString()
  url: string;
}

