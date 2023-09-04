import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { Collection, Polybase } from '@polybase/client';
import { generateUniqueId } from '~/shared/util/generateUniqueId';
import { CreateCollection, CollectionResponse, Item } from './collection.dto';
import { PolybaseService } from '~/shared/polybase';
import { LicenseModel } from '../license/license.dto';

@Injectable()
export class CollectionService {
  db: Polybase;
  eddieDb: Polybase;
  collection: Collection<any>;

  constructor(private polybaseService: PolybaseService) {
    this.db = polybaseService.app('khalifa');
    this.eddieDb = polybaseService.app('eddie');
    this.collection = this.db.collection('Collection');
  }

  async createCollection(createCollectionDto: CreateCollection) {
    const id = generateUniqueId();

    const collection = await this.collection.create([
      id,
      createCollectionDto.title,
      createCollectionDto.description,
      createCollectionDto.isPublic,
      createCollectionDto.tags,
      this.db.collection('User').record(createCollectionDto.owner as string),
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

  async changeVisibility(collectionId: string, isPublic: boolean) {
    await this.getCollection(collectionId);

    const { data: collection } = await this.collection
      .record(collectionId)
      .call('changeVisibility', [isPublic]);

    return collection;
  }

  async addItemToCollection(collectionId: string, itemId: string) {
    const collection = await this.getCollection(collectionId);

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

  async removeItemFromCollection(collectionId: string, itemId: string) {
    const collection = await this.getCollection(collectionId);

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

  async deleteCollection(collectionId: string) {
    await this.getCollection(collectionId);

    await this.collection.record(collectionId).call('deleteCollection');
  }
}
