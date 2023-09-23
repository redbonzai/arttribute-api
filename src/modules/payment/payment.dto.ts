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
  /**
   * @example "Celo"
   */
  @IsString()
  @IsNotEmpty()
  name: string;

  /**
   * @example "123e4567-e89b-12d3-a456-426614174000"
   */
  @IsString()
  @IsNotEmpty()
  chainId: string;
}

class Reference {
  /**
   * @example "item"
   */
  @IsDefined()
  @IsIn(['item', 'collection'])
  type!: 'item' | 'collection';

  /**
   * @example "123e4567-e89b-12d3-a456-426614174000"
   */
  @IsDefined()
  @IsUUID()
  id!: string;
}

export class CreatePayment {
  /**
   * Reference to the item or collection
   */
  @IsDefined()
  reference!: Reference;

  /**
   * The hash of the transaction
   * @example "0x123e4567e89b12d3a456426614174000"
   */
  @IsNotEmpty()
  @IsString()
  transactionHash: string;

  /**
   * The amount of transacted
   * @example 1000
   */
  @IsNotEmpty()
  @IsNumber()
  amount: number;

  /**
   * The currency of the transaction
   * @example "cUSD"
   */
  @IsNotEmpty()
  @IsString()
  currency: string;

  /**
   * The type of the transaction
   * @example "donation"
   */
  @IsNotEmpty()
  @IsString()
  type: string;

  /**
   * The source of the transaction
   * @example "vokali"
   */
  @IsString()
  source: string;

  /**
   * The network within which the transaction happened
   */
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
