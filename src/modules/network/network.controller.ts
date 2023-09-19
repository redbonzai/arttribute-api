import { Controller, Post, Body } from '@nestjs/common';
import { NetworkService } from './network.service';
import { CreateNetwork } from './network.dto';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('networks')
@Controller({ version: '1', path: 'networks' })
export class NetworkController {
  constructor(private readonly networkService: NetworkService) {}

  @ApiOperation({ summary: 'Create a network' })
  @ApiResponse({
    status: 201,
    description: 'The network has been successfully created.',
  })
  @Post()
  async createNetwork(@Body() networkDto: CreateNetwork) {
    return this.networkService.createNetwork(networkDto);
  }
}
