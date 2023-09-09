import { Controller, Post, Body, Get, Param, UseGuards } from '@nestjs/common';
import { RequestService } from './request.service';
import { CreateRequest } from './request.dto';
import { JwtAuthGuard, User } from '../auth';
import { JwtPayload } from 'jsonwebtoken';

@Controller({ version: '1', path: 'requests' })
export class RequestController {
  constructor(private readonly requestService: RequestService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async createRequest(
    @Body() requestDto: CreateRequest,
    @User() user: JwtPayload,
  ) {
    const userId = user.publicKey;
    return this.requestService.createRequest(requestDto, userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/received')
  async getReceivedRequests(@User() user: JwtPayload) {
    const userId = user.publicKey;
    return this.requestService.getReceivedRequests(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/sent')
  async getSentRequests(@User() user: JwtPayload) {
    const userId = user.publicKey;
    return this.requestService.getSentRequests(userId);
  }
}

