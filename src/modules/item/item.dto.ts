import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsNumberString,
  IsString,
} from 'class-validator';

export class ItemDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsString({ each: true })
  @IsArray()
  tags: string[];

  @IsNotEmpty()
  @IsString()
  author: string;

  @IsNotEmpty()
  @IsString()
  source: string;

  @IsString({ each: true })
  @IsArray()
  license: string[];

  @IsNotEmpty()
  @IsNumber()
  price: number;

  @IsString()
  currency: string;
}

export class CreateItemDto extends ItemDto {
  @IsString()
  owner: string;

  @IsNotEmpty()
  @IsNumberString()
  price: number;
}

export class UpdateItemDto extends ItemDto {}
