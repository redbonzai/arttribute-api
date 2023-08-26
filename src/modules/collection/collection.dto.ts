import {
  IsNotEmpty,
  IsString,
  IsArray,
  ValidateNested,
  IsBoolean,
} from 'class-validator';
import { Type } from 'class-transformer';

// temporary classes for user, license and Item
class User {
  @IsString()
  @IsNotEmpty()
  id: string;

  @IsString()
  @IsNotEmpty()
  name: string;
}

class License {
  @IsString()
  @IsNotEmpty()
  id: string;

  @IsString()
  @IsNotEmpty()
  name: string;
}

export class Item {
  @IsString()
  @IsNotEmpty()
  id: string;

  @IsString()
  @IsNotEmpty()
  name: string;
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

  @IsString()
  @IsNotEmpty()
  owner: string | User;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => License)
  license: License[];
}

export class CollectionResponse extends CreateCollection {
  id: string;
  items: Item[];
  owner: User;
  createdAt: string;
  updatedAt: string;
}

// Example JSON for create collection
// {
//     "title": "test",
//     "description": "test description",
//     "tags": ["ai", "ml", "iot"],
//     "owner": {
//       "id": "47",
//       "name": "Ifatos"
//     },
//     "license": [
//       {"id": "1", "name": "A-NC"},
//       {"id": "2", "name": "A-ND"}
//     ]
//   }
