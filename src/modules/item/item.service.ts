import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { Polybase, Collection } from '@polybase/client';
import { CIDString, Web3Storage, getFilesFromPath } from 'web3.storage';
import { UploadService } from 'src/shared/web3storage/upload.service';
import { PolybaseService } from '~/shared/polybase';
import { generateUniqueId } from '~/shared/util/generateUniqueId';
import { CreateItemDto, UpdateItemDto } from './item.dto';
import { JwtPayload } from 'jsonwebtoken';

@Injectable()
export class ItemService {
  private readonly db: Polybase;
  private readonly itemCollection: Collection<any>;

  constructor(
    private polybaseService: PolybaseService,
    private uploadService: UploadService,
  ) {
    this.db = polybaseService.app('eddie');
    this.itemCollection = this.db.collection('Item');
  }

  public async recordExists(id: string) {
    const item = await this.itemCollection.record(id).get();
    return item.exists();
  }

  public async findAll() {
    const { data: items } = await this.itemCollection.get();
    return items.map((item) => item.data);
  }

  public async findOne(id: string) {
    const { data: item } = await this.itemCollection.record(id).get();
    if (item) {
      return item;
    } else {
      throw new HttpException('record not found', HttpStatus.NOT_FOUND);
    }
  }

  public async create(createItem: CreateItemDto, file: Express.Multer.File) {
    const filePath = file.destination + '/' + file.filename;
    const uploadFile = await getFilesFromPath([filePath]);
    const cid: CIDString = await this.uploadService.upload(uploadFile);
    const LicenseCollection = this.db.collection('License');
    const url = this.generateURLfromCID(cid, file.filename);

    const id = generateUniqueId();
    const current_time = new Date().toISOString();
    const createdItem = await this.itemCollection.create([
      id,
      createItem.title,
      createItem.description,
      url,
      createItem.tags,
      createItem.author,
      this.db.collection('User').record(createItem.owner),
      createItem.source,
      //TODO: Validate license_IDs
      createItem.license.map((license_id) =>
        LicenseCollection.record(license_id),
      ),
      createItem.price,
      createItem.currency,
      current_time,
      current_time,
    ]);
    return createdItem;
  }

  public async update(id: string, updateItem: UpdateItemDto, user: JwtPayload) {
    if (this.recordExists(id)) {
      const current_time = new Date().toISOString();
      const LicenseCollection = this.db.collection('License');
      const oldItem = await this.itemCollection.record(id).get();

      const currency = Object.keys(oldItem.data.price)[0];
      let license;
      if (updateItem.license) {
        license = updateItem.license.map((license_id) =>
          LicenseCollection.record(license_id),
        );
      } else {
        license = oldItem.data.license;
      }
      const updatedItem = await this.itemCollection
        .record(id)
        .call('update', [
          updateItem.title || oldItem.data.title,
          updateItem.description || oldItem.data.description,
          updateItem.tags || oldItem.data.tags,
          updateItem.author || oldItem.data.author,
          updateItem.source || oldItem.data.source,
          license,
          current_time,
          updateItem.price || oldItem.data.price[currency],
          updateItem.currency || currency,
        ]);

      return this.findOne(id);
    } else {
      throw new HttpException('record not found', HttpStatus.NOT_FOUND);
    }
  }

  public async remove(id: string) {
    // await this.itemCollection.record(id).get();
    // return await this.itemCollection.record(id).call('del');

    try {
      await this.itemCollection.record(id).call('del');
    } catch (error) {
      switch (error.code) {
        case 'not-found':
          throw new HttpException('record not found', HttpStatus.NOT_FOUND);
        default:
          throw new HttpException(
            'record could not be deleted',
            HttpStatus.INTERNAL_SERVER_ERROR,
          );
      }
      // throw new HttpException('record not found', HttpStatus.NOT_FOUND);
    }
  }

  public generateURLfromCID(cid: string, fileName: string) {
    const url = `https://${cid}.ipfs.w3s.link/${fileName}`;
    return url;
  }
}
