import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { CreateItemDto } from './dto/create-item.dto';
import db from '../../shared/polybase/initPolybase';
import { Polybase, Collection } from '@polybase/client';
import { CIDString, Web3Storage, getFilesFromPath } from 'web3.storage';
import { UploadService } from 'src/shared/web3storage/upload.service';
import { UpdateItemDto } from './dto/update-item.dto';

@Injectable()
export class ItemService {
  private readonly db: Polybase;
  private readonly itemCollection: Collection<any>;

  constructor(private readonly uploadService: UploadService) {
    this.db = db;
    this.itemCollection = this.db.collection('Item');
  }

  async recordExists(id: string) {
    const item = await this.itemCollection.record(id).get();
    return item.exists();
  }

  async findAll() {
    const { data: items } = await this.itemCollection.get();
    return items.map((item) => item.data);
  }

  async findOne(id: string) {
    const { data: item } = await this.itemCollection.record(id).get();
    if (item) {
      return item;
    } else {
      throw new HttpException('record not found', HttpStatus.NOT_FOUND);
    }
  }

  async create(createItem: CreateItemDto, filePath: string) {
    const file = await getFilesFromPath([filePath]);
    const cid: CIDString = await this.uploadService.upload(file);

    // const ItemCollection = this.db.collection('Item');
    const LicenseCollection = this.db.collection('License');

    //replace with UUID
    const id = Date();
    const current_time = new Date().toISOString();
    const createdItem = await this.itemCollection.create([
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
      current_time,
      current_time,
    ]);
    return createdItem;
  }

  async update(id: string, updateItem: UpdateItemDto) {
    if (this.recordExists(id)) {
      const current_time = new Date().toISOString();
      const updatedItem = await this.itemCollection
        .record(id)
        .call('update', [
          updateItem.title,
          updateItem.description,
          updateItem.tags,
          updateItem.author,
          updateItem.source,
          updateItem.license,
          current_time,
        ]);

      return this.findOne(id);
    } else {
      throw new HttpException('record not found', HttpStatus.NOT_FOUND);
    }
  }

  async remove(id: string) {
    // await this.itemCollection.record(id).get();
    // return await this.itemCollection.record(id).call('del');

    try {
      await this.itemCollection.record(id).call('del');
    } catch (error) {
      return error;
      // throw new HttpException('record not found', HttpStatus.NOT_FOUND);
    }
  }
}
