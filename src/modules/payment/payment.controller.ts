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
import { APIKeyAuthGuard, JwtAuthGuard, User } from '../auth';
import { Project } from '../auth/decorators/project.decorator';

@Controller({ version: '1', path: 'payments' })
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @UseGuards(JwtAuthGuard)
  @UseGuards(APIKeyAuthGuard)
  @Post()
  async createPayment(
    @Body() paymentDto: CreatePayment,
    @User() user: JwtPayload,
    @Project() project: any,
  ) {
    return this.paymentService.createPayment(paymentDto, user, project);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  @Get('/received')
  async getUserPaymentsReceived(@User() user: JwtPayload) {
    return this.paymentService.getUserPaymentsReceived(user);
  }

  @Get('/sent')
  async getUserPaymentsSent(@User() user: JwtPayload) {
    return this.paymentService.getUserPaymentsSent(user);
  }

  @Get('/:source')
  async getPaymentsBySource(@Query('source') source: string) {
    return this.paymentService.getPaymentsBySource(source);
  }
}

