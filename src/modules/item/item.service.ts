import { Injectable } from '@nestjs/common';
import { CreateItemDto } from './dto/create-item.dto';
import db from '../../shared/polybase/initPolybase';
import { Polybase } from '@polybase/client';
import { CIDString, Web3Storage, getFilesFromPath } from 'web3.storage';
import { UploadService } from 'src/shared/web3storage/upload.service';

@Injectable()
export class ItemService {
  private readonly db: Polybase;
  // private readonly uploadService: UploadService;
  constructor(private readonly uploadService: UploadService) {
    this.db = db;
    // this.uploadService = UploadService;
  }

  findAll() {
    return `This action returns all item`;
  }

  findOne() {
    return `This action returns one item`;
  }

  async create(createItem: CreateItemDto, filePath: string) {
    const file = await getFilesFromPath([filePath]);
    const cid: CIDString = await this.uploadService.upload(file);

    const ItemCollection = this.db.collection('Item');
    const LicenseCollection = this.db.collection('License');

    //replace with UUID
    const id = Date();

    const createdItem = await ItemCollection.create([
      id,
      createItem.title,
      createItem.description,
      cid,
      createItem.tags,
      createItem.author,
      createItem.owner,
      createItem.source,
      createItem.license.map((license_id) =>
        LicenseCollection.record(license_id),
      ),
      createItem.created,
      createItem.updated,
    ]);
    return createdItem;
  }

  update() {
    return `This action updates an item`;
  }

  remove() {
    return `This action removes an item`;
  }
}
