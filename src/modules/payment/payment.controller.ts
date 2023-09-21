import {
  Body,
  Controller,
  Delete,
  Get,
  Post,
  Query,
  Param,
  UseGuards,
} from '@nestjs/common';
import { APIKeyAuthGuard, JwtAuthGuard, User, UserPayload } from '../auth';
import { Project } from '../auth/decorators/project.decorator';
import { CreatePayment } from './payment.dto';
import { PaymentService } from './payment.service';

@Controller({ version: '1', path: 'payments' })
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @UseGuards(JwtAuthGuard)
  @UseGuards(APIKeyAuthGuard)
  @Post()
  async createPayment(
    @Body() paymentDto: CreatePayment,
    @User() user: UserPayload,
    @Project() project: any,
  ) {
    return this.paymentService.createPayment(paymentDto, user, project);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/received')
  async getUserPaymentsReceived(@User() user: UserPayload) {
    return this.paymentService.getUserPaymentsReceived(user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/sent')
  async getUserPaymentsSent(@User() user: UserPayload) {
    return this.paymentService.getUserPaymentsSent(user);
  }

  @Get(':source')
  async getPaymentsBySource(@Param('source') source: string) {
    return this.paymentService.getPaymentsBySource(source);
  }

  //Delete Payment
  @Delete(':id')
  async deletePayment(@Param('id') id: string) {
    return this.paymentService.deletePayment(id);
  }
}

