import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard, User, UserPayload } from '../auth';
import { CreateRequest } from './request.dto';
import { RequestService } from './request.service';

@Controller({ version: '1', path: 'requests' })
export class RequestController {
  constructor(private readonly requestService: RequestService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async createRequest(
    @Body() requestDto: CreateRequest,
    @User() user: UserPayload,
  ) {
    const userId = user.publicKey;
    return this.requestService.createRequest(requestDto, userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/received')
  async getReceivedRequests(@User() user: UserPayload) {
    const userId = user.publicKey;
    return this.requestService.getReceivedRequests(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/sent')
  async getSentRequests(@User() user: UserPayload) {
    const userId = user.publicKey;
    return this.requestService.getSentRequests(userId);
  }
}
