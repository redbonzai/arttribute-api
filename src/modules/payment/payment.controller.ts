import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { PaymentService } from './payment.service';
import { CreatePayment } from './payment.dto';
import { JwtPayload } from 'jsonwebtoken';
import { JwtAuthGuard, User } from '../auth';

@Controller({ version: '1', path: 'payments' })
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async createPayment(
    @Body() paymentDto: CreatePayment,
    @User() user: JwtPayload,
  ) {
    return this.paymentService.createPayment(paymentDto, user);
  }

  @Get('/received/:userId')
  async getUserPaymentsReceived(@Param('userId') userId: string) {
    return this.paymentService.getUserPaymentsReceived(userId);
  }

  @Get('/sent/:userId')
  async getUserPaymentsSent(@Param('userId') userId: string) {
    return this.paymentService.getUserPaymentsSent(userId);
  }

  @Get('/:source')
  async getPaymentsBySource(@Query('source') source: string) {
    return this.paymentService.getPaymentsBySource(source);
  }
}

