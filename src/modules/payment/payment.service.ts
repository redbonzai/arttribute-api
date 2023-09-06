import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreatePayment } from './payment.dto';
import { Collection, Polybase } from '@polybase/client';
import { generateUniqueId } from '~/shared/util/generateUniqueId';
import { PolybaseService } from '~/shared/polybase';
import { JwtPayload } from 'jsonwebtoken';
import { ethers } from 'ethers';

@Injectable()
export class PaymentService {
  db: Polybase;
  paymentCollection: Collection<any>;
  itemCollection: Collection<any>;
  collectionsCollection: Collection<any>;
  networkCollection: Collection<any>;

  constructor(private polybaseService: PolybaseService) {
    this.db = polybaseService.app('bashy');
    this.paymentCollection = this.db.collection('Payment');
    this.itemCollection = this.db.collection('Item');
    this.collectionsCollection = this.db.collection('Collection');
    this.networkCollection = this.db.collection('Network');
  }

  public async findReference(
    id: string,
    type: string,
  ): Promise<{
    id: string;
    type: string;
    owner: {
      id: string;
      address: string;
    };
    price: { amount: number; currency: string };
  }> {
    if (type === 'item') {
      const { data: item } = await this.itemCollection.record(id).get();
      if (item) {
        const { data: owner } = await this.db
          .collection('User')
          .record(item.owner.id)
          .get();
        return {
          id: item.id,
          type: 'item',
          owner: {
            id: item.owner.id,
            address: owner.address,
          },
          price: item.price,
        };
      } else {
        throw new HttpException('record not found', HttpStatus.NOT_FOUND);
      }
    } else if (type === 'collection') {
      const { data: collection } = await this.collectionsCollection
        .record(id)
        .get();
      if (collection) {
        const { data: owner } = await this.db
          .collection('User')
          .record(collection.owner.id)
          .get();
        return {
          id: collection.id,
          type: 'collection',
          owner: {
            id: collection.owner.id,
            address: owner.address,
          },
          price: collection.price,
        };
      } else {
        throw new HttpException('record not found', HttpStatus.NOT_FOUND);
      }
    } else {
      throw new HttpException(
        `reference ${type} does not exist`,
        HttpStatus.NOT_FOUND,
      );
    }
  }

  public async findNetwork(chainId: string): Promise<{ id: string }> {
    const { data: network } = await this.networkCollection
      .record(chainId)
      .get();
    if (network) {
      return { id: network.id };
    } else {
      throw new HttpException('Network not supported', HttpStatus.NOT_FOUND);
    }
  }

  async createPayment(paymentDto: CreatePayment, user: JwtPayload) {
    const id = generateUniqueId();
    const createdAt = new Date().toISOString();
    const reference = await this.findReference(
      paymentDto.reference.id,
      paymentDto.reference.type,
    );
    const paymentType = reference.price.amount > 0 ? 'fee' : 'gift';

    //check if sender is not the owner of the reference
    if (reference.owner.id === user.publicKey) {
      throw new HttpException(
        'You cannot pay for your own item',
        HttpStatus.BAD_REQUEST,
      );
    }

    //check if payment amount is less than the required price
    if (paymentDto.amount < reference.price.amount) {
      throw new HttpException(
        'Payment amount is less than the required  price',
        HttpStatus.BAD_REQUEST,
      );
    }

    //To do: get endpoint from network
    const network = await this.findNetwork(paymentDto.network.chainId);

    //Confirm transaction on the blockchain
    const provider = new ethers.JsonRpcProvider(
      'https://celo-alfajores.infura.io/v3/80b986daf63447ceb9978477a1b451c9',
    );

    const tx = await provider.getTransaction(paymentDto.transactionHash);
    if (
      (tx && tx.to.toLowerCase() != reference.owner.address.toLowerCase()) ||
      ethers.formatEther(tx.value) < paymentDto.amount.toString()
    ) {
      throw new HttpException(
        'Invalid transaction hash',
        HttpStatus.BAD_REQUEST,
      );
    }
    const txresult = await tx.wait();
    if (txresult.status != 1) {
      throw new HttpException('Transaction failed', HttpStatus.BAD_REQUEST);
    }
    //create payment once transaction is confirmed

    const payment = await this.paymentCollection.create([
      id,
      paymentDto.reference.type,
      paymentDto.reference.id,
      this.db.collection('User').record(user.publicKey),
      this.db.collection('User').record(reference.owner.id),
      paymentDto.amount,
      paymentDto.currency,
      paymentType,
      paymentDto.source,
      this.db.collection('Network').record(network.id),
      createdAt,
    ]);
    return payment;
  }

  //get user payments received
  async getUserPaymentsReceived(userId: string) {
    const payments = await this.paymentCollection
      .where('receiver', '==', this.db.collection('User').record(userId))
      .sort('created', 'desc')
      .get();
    return payments;
  }

  //get user payments sent
  async getUserPaymentsSent(userId: string) {
    const payments = await this.paymentCollection
      .where('sender', '==', this.db.collection('User').record(userId))
      .sort('created', 'desc')
      .get();
    return payments;
  }

  //get payments by source
  async getPaymentsBySource(source: string) {
    const payments = await this.paymentCollection
      .where('source', '==', source)
      .sort('created', 'desc')
      .get();
    return payments;
  }
}

