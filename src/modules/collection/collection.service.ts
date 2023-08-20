import { Injectable, NotFoundException } from '@nestjs/common';
import { Collection, Polybase } from '@polybase/client';
import { generateUniqueId } from 'src/shared/generateUniqueId';
import { db } from 'src/shared/polybase/initPolybase';
import { CreateCollection, CollectionResponse } from './collection.model';

@Injectable()
export class CollectionService {
  db: Polybase;
  collection: Collection<any>;

  constructor() {
    this.db = db;
    this.collection = this.db.collection('Collection');
  }

  async createCollection(createCollectionDto: CreateCollection) {
    const id = generateUniqueId();

    const collection = await this.collection.create([
      id,
      createCollectionDto.title,
      createCollectionDto.description,
      createCollectionDto.tags,
      db.collection('User').record(createCollectionDto.owner.id),
      createCollectionDto.license.map((license) =>
        db.collection('License').record(license.id),
      ),
    ]);
    return collection;
  }

  async getAllCollections(): Promise<CollectionResponse[]> {
    const { data: collections } = await this.collection.get();

    if (!collections) throw new NotFoundException('No collections found');
    return collections.map((collection) => collection.data);
  }

  async getCollectionsForUser(userId: string): Promise<CollectionResponse[]> {
    const { data: collections } = await this.collection
      .where('owner', '==', db.collection('User').record(userId))
      .get();

    if (!collections || collections.length === 0)
      throw new NotFoundException('No collections found for this user');
    return collections.map((collection) => collection.data);
  }

  async getCollection(collectionId: string): Promise<CollectionResponse> {
    const { data: collection } = await this.collection
      .record(collectionId)
      .get();

    if (!collection) throw new NotFoundException('Collection not found');
    return collection;
  }
}
