import {
  IsNotEmpty,
  IsString,
  IsArray,
  ValidateNested,
  IsBoolean,
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

  @IsArray()
  @IsNotEmpty()
  @IsString({ each: true })
  license: string[] | LicenseModel[];
}

export class CollectionResponse extends CreateCollection {
  id: string;
  items: Item[];
  license: LicenseModel[];
  owner: User;
  createdAt: string;
  updatedAt: string;
}
