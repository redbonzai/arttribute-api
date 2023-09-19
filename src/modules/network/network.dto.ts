import { IsString, IsNotEmpty } from 'class-validator';

class Network {
  /**
   * The unique identifier of the network chain registered
   * @example "123e4567-e89b-12d3-a456-426614174000"
   */
  @IsString()
  @IsNotEmpty()
  chainId: string;

  /**
   * Name of the chain
   * @example "celo"
   */
  @IsString()
  @IsNotEmpty()
  name: string;

  /**
   * The endpoint enabling communication with a network
   * @example "https://rpc.mainnet.near.org"
   */
  @IsString()
  @IsNotEmpty()
  rpcUrl: string;

  /**
   * The currency of the network
   * @example "ether"
   */
  @IsString()
  @IsNotEmpty()
  currency: string;

  /**
   * The API endpoint for the network
   * @example "https://api.etherscan.io/api"
   */
  @IsString()
  @IsNotEmpty()
  endpoint: string;
}

export class CreateNetwork extends Network {}
