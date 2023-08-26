import {
  IsArray,
  IsString,
  IsNumber,
  IsNotEmpty,
  ValidateNested,
} from 'class-validator';

import { Type } from 'class-transformer';

// temporary classes for user and network
class User {
  @IsString()
  @IsNotEmpty()
  id: string;

  @IsString()
  @IsNotEmpty()
  name: string;
}

class Network {
  @IsString()
  @IsNotEmpty()
  id: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  rpcUrl: string;

  @IsString()
  @IsNotEmpty()
  chainId: string;

  @IsString()
  @IsNotEmpty()
  symbol: string;
}

export class CreatePayment {
  @IsNotEmpty()
  @IsString()
  id: string;

  @IsArray()
  @IsNotEmpty()
  @IsString({ each: true })
  payedFor: string[];

  @IsNotEmpty()
  @ValidateNested()
  @Type(() => User)
  sender: User;

  @IsNotEmpty()
  @ValidateNested()
  @Type(() => User)
  receiver: User;

  @IsNotEmpty()
  @IsNumber()
  amount: number;

  @IsNotEmpty()
  @IsString()
  currency: string;

  @IsNotEmpty()
  @IsString()
  type: string;

  @IsNotEmpty()
  @IsString()
  source: string;

  @IsNotEmpty()
  @ValidateNested()
  @Type(() => Network)
  network: Network;

  @IsNotEmpty()
  @IsString()
  created: string;
}

// Example JSON for create payment
// {
//   "id": "1",
//   "payedFor": ["id", "item/collection"],
//   "sender": {
//     "id": "1",
//     "name": "Bashy"
//   },
//   "receiver": {
//     "id": "47",
//     "name": "Ifatos"
//   },
//   "amount": 10,
//   "currency": "cUSD",
//   "type": "donation/royalty",
//   "source": "vokali.com-123e52yhu9898",
//   "network": {
//     "id": "1",
//     "name": "Celo",
//     "rpcUrl": "https://forno.celo.org",
//     "chainId": "42220",
//     "symbol": "CELO"
//   }
//  "created": "2021-05-05T12:00:00.000Z"
// }
