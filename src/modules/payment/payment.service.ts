import { Injectable } from '@nestjs/common';
import { CreatePayment } from './payment.dto';
import { Collection, Polybase } from '@polybase/client';
import { generateUniqueId } from 'src/shared/generateUniqueId';
import { db } from 'src/shared/polybase/initPolybase';

@Injectable()
export class PaymentService {
  db: Polybase;
  collection: Collection<any>;

  constructor() {
    this.db = db;
    this.collection = this.db.collection('Payment');
  }

  async createPayment(paymentDto: CreatePayment) {
    const id = generateUniqueId();
    const createdAt = new Date().toISOString();

    const payment = await this.collection.create([
      id,
      paymentDto.payedFor,
      db.collection('User').record(paymentDto.sender.id),
      db.collection('User').record(paymentDto.receiver.id),
      paymentDto.amount,
      paymentDto.currency,
      paymentDto.type,
      paymentDto.source,
      db.collection('Network').record(paymentDto.network.id),
      createdAt,
    ]);
    return payment;
  }

  //get user payments received
  async getUserPaymentsReceived(userId: string) {
    const payments = await this.collection
      .where('receiver', '==', db.collection('User').record(userId))
      .sort('created', 'desc')
      .get();
    return payments;
  }

  //get user payments sent
  async getUserPaymentsSent(userId: string) {
    const payments = await this.collection
      .where('sender', '==', db.collection('User').record(userId))
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
