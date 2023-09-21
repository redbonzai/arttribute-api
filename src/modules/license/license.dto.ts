import { IsNotEmpty, IsString } from 'class-validator';

export class LicenseModel {
  @IsNotEmpty()
  @IsString()
  id!: string;

  @IsNotEmpty()
  @IsString()
  name!: string;

  @IsNotEmpty()
  @IsString()
  description!: string;

  @IsString()
  symbol: string;

  @IsString()
  family: string;
}

