import { IsString, IsNotEmpty, ValidateNested } from 'class-validator';

import { Type } from 'class-transformer';

class User {
  @IsString()
  @IsNotEmpty()
  id: string;

  @IsString()
  @IsNotEmpty()
  name: string;
}

export class ProjectDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsString()
  url: string;
}

export class CreateProject extends ProjectDto {
  @IsNotEmpty()
  @IsString()
  id: string;

  @IsNotEmpty()
  @ValidateNested()
  @Type(() => User)
  owner: User;

  @IsNotEmpty()
  @IsString()
  name: string;

  @IsString()
  url: string;
}

export class UpdateProject extends ProjectDto {}

