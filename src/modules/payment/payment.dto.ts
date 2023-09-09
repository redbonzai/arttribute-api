import {
  IsArray,
  IsString,
  IsNumber,
  IsNotEmpty,
  ValidateNested,
  IsDefined,
  IsIn,
  IsUUID,
} from 'class-validator';

import { Type } from 'class-transformer';

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
  name: string;

  @IsString()
  @IsNotEmpty()
  chainId: string;
}

class Reference {
  @IsDefined()
  @IsIn(['item', 'collection'])
  type!: 'item' | 'collection';

  @IsDefined()
  @IsUUID()
  id!: string;
}

export class CreatePayment {
  @IsDefined()
  reference!: Reference;

  @IsNotEmpty()
  @IsString()
  transactionHash: string;

  @IsNotEmpty()
  @IsNumber()
  amount: number;

  @IsNotEmpty()
  @IsString()
  currency: string;

  @IsNotEmpty()
  @IsString()
  type: string;

  @IsString()
  source: string;

  @IsNotEmpty()
  @ValidateNested()
  @Type(() => Network)
  network: Network;
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

