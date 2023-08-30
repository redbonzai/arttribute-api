import { Injectable } from '@nestjs/common';
import { CreatePayment } from './payment.dto';
import { Collection, Polybase } from '@polybase/client';
import { generateUniqueId } from '~/shared/util/generateUniqueId';
import { PolybaseService } from '~/shared/polybase';

@Injectable()
export class PaymentService {
  db: Polybase;
  collection: Collection<any>;

  constructor(private polybaseService: PolybaseService) {
    this.db = polybaseService.app('bashy');
    this.collection = this.db.collection('Payment');
  }

  async createPayment(paymentDto: CreatePayment) {
    const id = generateUniqueId();
    const createdAt = new Date().toISOString();

    const payment = await this.collection.create([
      id,
      paymentDto.payedFor,
      this.db.collection('User').record(paymentDto.sender.id),
      this.db.collection('User').record(paymentDto.receiver.id),
      paymentDto.amount,
      paymentDto.currency,
      paymentDto.type,
      paymentDto.source,
      this.db.collection('Network').record(paymentDto.network.id),
      createdAt,
    ]);
    return payment;
  }

  //get user payments received
  async getUserPaymentsReceived(userId: string) {
    const payments = await this.collection
      .where('receiver', '==', this.db.collection('User').record(userId))
      .sort('created', 'desc')
      .get();
    return payments;
  }

  //get user payments sent
  async getUserPaymentsSent(userId: string) {
    const payments = await this.collection
      .where('sender', '==', this.db.collection('User').record(userId))
      .sort('created', 'desc')
      .get();
    return payments;
  }

  //get payments by source
  async getPaymentsBySource(source: string) {
    const payments = await this.collection
      .where('source', '==', source)
      .sort('created', 'desc')
      .get();
    return payments;
  }
}
