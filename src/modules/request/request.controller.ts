import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard, User, UserPayload } from '../auth';
import { CreateRequest, UpdateRequest } from './request.dto';
import { RequestService } from './request.service';
import { Authentication, Project } from '../auth/decorators';

@Controller({ version: '1', path: 'requests' })
export class RequestController {
  constructor(private readonly requestService: RequestService) {}

  @Authentication('jwt')
  @Post()
  async createRequest(
    @Body() requestDto: CreateRequest,
    @User() user: UserPayload,
  ) {
    const userId = user.sub;
    return this.requestService.createRequest(requestDto, userId);
  }

  @Authentication('jwt')
  @Get('/received')
  async getReceivedRequests(@User() user: UserPayload) {
    const userId = user.sub;
    return this.requestService.getReceivedRequests(userId);
  }

  @Authentication('jwt')
  @Get('/sent')
  async getSentRequests(@User() user: UserPayload) {
    const userId = user.sub;
    return this.requestService.getSentRequests(userId);
  }

  @Authentication('jwt')
  @Patch(':id')
  async updateRequestStatus(
    @Body() updateDto: UpdateRequest,
    @User() user: UserPayload,
    @Param('id') id: string,
  ) {
    const userId = user.sub;
    return this.requestService.updateRequestStatus(updateDto, id, userId);
  }

  //Delete Request
  @Delete(':id')
  async deletePayment(@Param('id') id: string) {
    return this.requestService.deleteRequest(id);
  }
}

