import {
  IsArray,
  IsBooleanString,
  IsBoolean,
  IsDefined,
  IsNotEmpty,
  IsNumber,
  IsNumberString,
  IsObject,
  IsString,
  IsIn,
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

  @IsString({ each: true })
  @IsArray()
  tags: string[];

  @IsNotEmpty()
  @IsString()
  author: string;

  @IsNotEmpty()
  @IsString()
  source: string;

  @IsNotEmpty()
  @IsNumberString()
  price_amount: string;

  @IsNotEmpty()
  @IsString()
  price_currency: Price;

  @IsString({ each: true })
  @IsArray()
  @IsIn(['ATR', 'NCM', 'NDR'], { each: true })
  license: string[];

  @IsNotEmpty()
  @IsBooleanString()
  needsRequest: boolean;
}

export class CreateItemDto extends ItemDto {}

export class ItemResponse extends CreateItemDto {
  id: string;
  license: any;
  createdAt: string;
  updatedAt: string;
}

export class UpdateItemDto extends ItemDto {
  @IsString()
  title: string;
  @IsString()
  description: string;
  @IsString()
  url: string;
  @IsString({ each: true })
  @IsArray()
  tags: string[];
  @IsString()
  author: string;
  @IsString()
  source: string;
  @IsObject()
  price: Price;
  @IsString({ each: true })
  @IsArray()
  license: string[];
  @IsBooleanString()
  needsRequest: boolean;
}

