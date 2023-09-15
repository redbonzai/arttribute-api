import { Controller, Post, Body } from '@nestjs/common';
import { NetworkService } from './network.service';
import { CreateNetwork } from './network.dto';

@Controller({ version: '1', path: 'networks' })
export class NetworkController {
  constructor(private readonly networkService: NetworkService) {}

  @Post()
  async createNetwork(@Body() networkDto: CreateNetwork) {
    return this.networkService.createNetwork(networkDto);
  }
}

