import { IsNotEmpty, IsString, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

// temporary classes for user and license
class User {
  @IsString()
  @IsNotEmpty()
  id: string;

  @IsString()
  @IsNotEmpty()
  name: string;
}

class License {
  id: string;
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
