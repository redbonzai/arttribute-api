import {
  IsArray,
  IsBooleanString,
  IsDefined,
  IsNotEmpty,
  IsNumber,
  IsNumberString,
  IsObject,
  IsString,
} from 'class-validator';

class Price {
  @IsNotEmpty()
  @IsNumber()
  amount!: number;

  @IsNotEmpty()
  @IsString()
  currency!: string;
}

export class ItemDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsNotEmpty()
  @IsString()
  url: string;

  @IsString({ each: true })
  @IsArray()
  tags: string[];

  @IsNotEmpty()
  @IsString()
  author: string;

  @IsNotEmpty()
  @IsString()
  source: string;

  @IsObject()
  price!: Price;

  @IsString({ each: true })
  @IsArray()
  license: string[];

  @IsNotEmpty()
  @IsBooleanString()
  needsRequest: boolean;
}

export class CreateItemDto extends ItemDto {}

export class UpdateItemDto extends ItemDto {}

