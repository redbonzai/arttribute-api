import { Injectable } from '@nestjs/common';
import { Collection, Polybase } from '@polybase/client';
import { PolybaseService } from '~/shared/polybase';
import { CreateNetwork } from './network.dto';

@Injectable()
export class NetworkService {
  db: Polybase;
  networkCollection: Collection<any>;

  constructor(private polybaseService: PolybaseService) {
    this.db = polybaseService.app('bashy');
    this.networkCollection = this.db.collection('Network');
  }

  //create network
  async createNetwork(networkDto: CreateNetwork) {
    const current_time = new Date().toISOString();
    const network = await this.networkCollection.create([
      networkDto.chainId,
      networkDto.name,
      networkDto.rpcUrl,
      networkDto.chainId,
      networkDto.currency,
      networkDto.endpoint,
      current_time,
      current_time,
    ]);
    return network;
  }
}

