import { ApiProperty } from '@nestjs/swagger';
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
  /**
   * @example 100
   */
  @IsNotEmpty()
  @IsNumber()
  amount!: number;

  /**
   * @example "KSH"
   */
  @IsNotEmpty()
  @IsString()
  currency!: string;
}

export class ItemDto {
  /**
   * Name of the item
   * @example "My Item"
   */
  @IsNotEmpty()
  @IsString()
  title: string;

  /**
   * Description of the item
   * @example "This is my item"
   */
  @IsNotEmpty()
  @IsString()
  description: string;

  /**
   * Tags for the item
   * @example ["AI", "ML", "Data Science"]
   */
  @IsString({ each: true })
  @IsArray()
  tags: string[];

  /**
   * Author of the item
   * @example "John Doe"
   */
  @IsNotEmpty()
  @IsString()
  author: string;

  /**
   * Source of the item
   * @example "Arttribute"
   */
  @IsNotEmpty()
  @IsString()
  source: string;

  /**
   * Price for the item
   * @example 100
   */
  // TODO: fix this
  @IsNotEmpty()
  @IsNumberString()
  price_amount: string;

  /**
   * Price of the item
   * @example "KSH"
   */
  @IsNotEmpty()
  @IsString()
  price_currency: string;

  /**
   * Licenses for the item
   * @example ["ATR", "NCM", "NDR"]
   */
  @IsString({ each: true })
  @IsArray()
  @IsIn(['ATR', 'NCM', 'NDR'], { each: true })
  license: string[];

  /**
   * Whether the item needs request or not
   * @example true
   */
  @IsNotEmpty()
  @IsBooleanString()
  needsRequest: boolean;
}

export class CreateItemDto extends ItemDto {
  @ApiProperty({ type: 'string', format: 'binary' })
  file: Express.Multer.File;
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
