import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { APIKeyAuthGuard, JwtAuthGuard, User, UserPayload } from '../auth';
import { Project } from '../auth/decorators';
import { CreatePayment } from './payment.dto';
import { PaymentService } from './payment.service';
import { CreatePayment } from './payment.dto';

@Controller('payments')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post()
  async createPayment(@Body() paymentDto: CreatePayment) {
    return this.paymentService.createPayment(paymentDto);
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
