import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class User {
  @IsNotEmpty()
  @IsString()
  id: string;

  @IsNotEmpty()
  @IsNumber()
  publicKey: string;

  @IsNotEmpty()
  @IsString()
  address: string;

  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  created: string;
}

export class CreateUser extends User {
  @IsString()
  @IsNotEmpty()
  address: string;
}

