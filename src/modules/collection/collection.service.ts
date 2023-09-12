import {
  Injectable,
  NotFoundException,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { Collection, Polybase } from '@polybase/client';
import { generateUniqueId } from '~/shared/util/generateUniqueId';
import { CreateCollection, CollectionResponse, Item } from './collection.dto';
import { PolybaseService } from '~/shared/polybase';
import { LicenseModel } from '../license/license.dto';
import { JwtPayload } from 'jsonwebtoken';

@Injectable()
export class CollectionService {
  db: Polybase;
  eddieDb: Polybase;
  bashyDb: Polybase;
  collection: Collection<any>;

  constructor(private polybaseService: PolybaseService) {
    this.db = polybaseService.app('khalifa');
    this.eddieDb = polybaseService.app('eddie');
    this.bashyDb = polybaseService.app('bashy');
    this.collection = this.db.collection('Collection');
  }

  async createCollection(
    createCollectionDto: CreateCollection,
    user: JwtPayload,
  ) {
    const id = generateUniqueId();

    const collection = await this.collection.create([
      id,
      createCollectionDto.title,
      createCollectionDto.description,
      createCollectionDto.isPublic,
      createCollectionDto.tags,
      this.bashyDb.collection('User').record(user.publicKey),
      new Date().toISOString(),
      new Date().toISOString(),
      createCollectionDto.license.map((license) =>
        this.eddieDb.collection('License').record(license),
      ),
    ]);
    return collection;
  }

  async getAllCollections(): Promise<CollectionResponse[]> {
    const { data: collections } = await this.collection.get();

    if (!collections) throw new NotFoundException('No collections found');
    return collections.map((collection) => collection.data);
  }

  public async getCollectionsForUser(
    userId: string,
  ): Promise<CollectionResponse[]> {
    const { data: collections } = await this.collection
      .where('owner', '==', this.db.collection('User').record(userId))
      .get();

    if (!collections)
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

  async changeVisibility(
    collectionId: string,
    isPublic: boolean,
    user: JwtPayload,
  ) {
    const curr = await this.getCollection(collectionId);

    if (curr.owner.id !== user.publicKey) {
      throw new UnauthorizedException(
        'Only the owner can change the visibility of a collection',
      );
    }

    const { data: collection } = await this.collection
      .record(collectionId)
      .call('changeVisibility', [isPublic]);

    return collection;
  }

  async addItemToCollection(
    collectionId: string,
    itemId: string,
    user: JwtPayload,
  ) {
    const collection = await this.getCollection(collectionId);

    if (collection.owner.id !== user.publicKey) {
      throw new UnauthorizedException(
        'Only the owner can add items to a collection',
      );
    }

    // TODO: integrate with actual Item module
    const record = await this.eddieDb.collection('Item').record(itemId).get();
    const item = record.data;

    if (!record || !item) throw new NotFoundException('Item not found');

    if (collection.items.find((i) => i.id == item.id))
      throw new ConflictException('Item already in collection');

    const newLicenses = [];

    for (const license of item.license) {
      if (!collection.license.find((l) => l.id == license.id)) {
        newLicenses.push(license);
      }
    }

    const { data: collections } = await this.collection
      .record(collectionId)
      .call('addItemToCollection', [
        record,
        newLicenses.length === 0 ? undefined : newLicenses,
      ]);

    return collections;
  }

  async removeItemFromCollection(
    collectionId: string,
    itemId: string,
    user: JwtPayload,
  ) {
    const collection = await this.getCollection(collectionId);

    if (collection.owner.id !== user.publicKey) {
      throw new UnauthorizedException(
        'Only the owner can remove items from a collection',
      );
    }

    if (!collection.items.find((i) => i.id == itemId))
      throw new NotFoundException('Item not found');

    const items: Item[] = collection.items.filter((i) => i.id != itemId);

    const newLicenses: LicenseModel[] = [];
    const seen = new Set<string>();

    for (const item of items) {
      for (const license of item.license) {
        if (!seen.has(license.id)) {
          seen.add(license.id);
          newLicenses.push(license);
        }
      }
    }

    const { data: collections } = await this.collection
      .record(collectionId)
      .call('removeItemFromCollection', [items as any, newLicenses]);

    return collections;
  }

  async deleteCollection(collectionId: string, user: JwtPayload) {
    const collection = await this.getCollection(collectionId);

    if (collection.owner.id !== user.publicKey) {
      throw new UnauthorizedException('Only the owner can delete a collection');
    }

    await this.collection.record(collectionId).call('del');
  }
}
