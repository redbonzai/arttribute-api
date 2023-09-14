import {
  IsNotEmpty,
  IsString,
  IsArray,
  ValidateNested,
  IsBoolean,
  IsNumber,
  IsObject,
  IsBooleanString,
} from 'class-validator';
import { Type } from 'class-transformer';
import { LicenseModel } from '../license/license.dto';

class User {
  id: string;
  publicKey: string;
  address: string;
  name: string;
  created: string;
}

// temporary classes for license and Item
export class Item {
  @IsString()
  @IsNotEmpty()
  id: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LicenseModel)
  license: LicenseModel[];
}

class Price {
  @IsNotEmpty()
  @IsNumber()
  amount!: number;

  @IsNotEmpty()
  @IsString()
  currency!: string;
}

export class CreateCollection {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsBoolean()
  @IsNotEmpty()
  isPublic: boolean;

  @IsArray()
  @IsNotEmpty()
  @IsString({ each: true })
  tags: string[];

  @IsObject()
  price!: Price;

  @IsArray()
  @IsNotEmpty()
  @IsString({ each: true })
  license: string[];

  @IsNotEmpty()
  @IsBooleanString()
  needsRequest: boolean;
}

export class CollectionResponse extends CreateCollection {
  id: string;
  items: Item[];
  license: any;
  owner: User;
  createdAt: string;
  updatedAt: string;
}

