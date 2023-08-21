import { IsNotEmpty, IsString, IsArray, ValidateNested } from 'class-validator';
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

  @IsArray()
  @IsNotEmpty()
  @IsString({ each: true })
  tags: string[];

  @IsNotEmpty()
  @ValidateNested()
  @Type(() => User)
  owner: User;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => License)
  license: License[];
}

export class CollectionResponse extends CreateCollection {
  id: string;
  items: Item[];
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
