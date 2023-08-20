import { Injectable } from '@nestjs/common';
import { Collection, Polybase } from '@polybase/client';
import { generateUniqueId } from 'src/shared/generateUniqueId';
import { db } from 'src/shared/polybase/initPolybase';
import { CreateCollection } from './collection.model';

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
}
