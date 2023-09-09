import { IsString, IsNotEmpty } from 'class-validator';

import { Type } from 'class-transformer';

class Network {
  @IsString()
  @IsNotEmpty()
  chainId: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  rpcUrl: string;

  @IsString()
  @IsNotEmpty()
  currency: string;

  @IsString()
  @IsNotEmpty()
  endpoint: string;
}

export class CreateNetwork extends Network {}

