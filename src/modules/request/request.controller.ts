import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard, User, UserPayload } from '../auth';
import { CreateRequest } from './request.dto';
import { RequestService } from './request.service';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

@ApiBearerAuth()
@ApiTags('requests')
@Controller({ version: '1', path: 'requests' })
export class RequestController {
  constructor(private readonly requestService: RequestService) {}

  @ApiOperation({ summary: 'Create a new request' })
  @ApiResponse({
    status: 201,
    description: 'Successfully created a new request',
  })
  @ApiResponse({ status: 400, description: 'You cannot request your own item' })
  @UseGuards(JwtAuthGuard)
  @Post()
  async createRequest(
    @Body() requestDto: CreateRequest,
    @User() user: UserPayload,
  ) {
    const userId = user.publicKey;
    return this.requestService.createRequest(requestDto, userId);
  }

  @ApiOperation({ summary: 'Get received requests' })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved received requests',
  })
  @UseGuards(JwtAuthGuard)
  @Get('/received')
  async getReceivedRequests(@User() user: UserPayload) {
    const userId = user.publicKey;
    return this.requestService.getReceivedRequests(userId);
  }

  @ApiOperation({ summary: 'Get sent requests' })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved sent requests',
  })
  @UseGuards(JwtAuthGuard)
  @Get('/sent')
  async getSentRequests(@User() user: UserPayload) {
    const userId = user.publicKey;
    return this.requestService.getSentRequests(userId);
  }
}
