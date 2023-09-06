import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateRequest, UpdateRequest } from './request.dto';
import { Collection, Polybase } from '@polybase/client';
import { generateUniqueId } from '~/shared/util/generateUniqueId';
import { PolybaseService } from '~/shared/polybase';

@Injectable()
export class RequestService {
  db: Polybase;
  requestCollection: Collection<any>;
  itemCollection: Collection<any>;
  collectionsCollection: Collection<any>;

  constructor(private polybaseService: PolybaseService) {
    this.db = polybaseService.app('bashy');
    this.requestCollection = this.db.collection('PermissionRequest');
    this.itemCollection = this.db.collection('Item');
    this.collectionsCollection = this.db.collection('Collection');
  }

  public async findReference(
    id: string,
    type: string,
  ): Promise<{ id: string; type: string; owner: string }> {
    if (type === 'item') {
      const { data: item } = await this.itemCollection.record(id).get();
      if (item) {
        return { id: item.id, type: 'item', owner: item.owner.id };
      } else {
        throw new HttpException('record not found', HttpStatus.NOT_FOUND);
      }
    } else if (type === 'collection') {
      const { data: collection } = await this.collectionsCollection
        .record(id)
        .get();
      if (collection) {
        return {
          id: collection.id,
          type: 'collection',
          owner: collection.owner.id,
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

  async createRequest(requestDto: CreateRequest, senderId: string) {
    const requestReference = await this.findReference(
      requestDto.reference.id,
      requestDto.reference.type,
    );
    //check if sender is not the owner of the reference
    if (requestReference.owner === senderId) {
      throw new HttpException(
        'You cannot request your own item',
        HttpStatus.BAD_REQUEST,
      );
    }

    const receiverId = requestReference.owner;
    const accepted = false;
    const closed = false;

    const id = generateUniqueId();
    const current_time = new Date().toISOString();

    const payment = await this.requestCollection.create([
      id,
      requestDto.reference.type,
      requestDto.reference.id,
      this.db.collection('User').record(senderId),
      this.db.collection('User').record(receiverId),
      requestDto.senderNote,
      accepted,
      closed,
      current_time,
      current_time,
    ]);
    return payment;
  }

  //get received requests
  async getReceivedRequests(userId: string) {
    const requests = await this.requestCollection
      .where('receiver', '==', this.db.collection('User').record(userId))
      .sort('created', 'desc')
      .get();
    return requests;
  }
  //get sent requests
  async getSentRequests(userId: string) {
    const requests = await this.requestCollection
      .where('sender', '==', this.db.collection('User').record(userId))
      .sort('created', 'desc')
      .get();
    return requests;
  }

  //update request status
  async updateRequestStatus(
    updateDto: UpdateRequest,
    requestId: string,
    userId: string,
  ) {
    const current_time = new Date().toISOString();
    const request = await this.requestCollection.record(requestId).get();
    if (!request) {
      throw new HttpException('record not found', HttpStatus.NOT_FOUND);
    }
    if (request.data.receiver.id !== userId) {
      throw new HttpException('Unauthorized action', HttpStatus.UNAUTHORIZED);
    }

    const updatedRequest = await this.requestCollection
      .record(requestId)
      .call('update', [updateDto.accepted, true, current_time]);
    return updatedRequest;
  }
}

