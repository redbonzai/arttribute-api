import {
  Injectable,
  HttpException,
  HttpStatus,
  UnauthorizedException,
} from '@nestjs/common';
import { Polybase, Collection } from '@polybase/client';
import { CIDString, Web3Storage, getFilesFromPath, File } from 'web3.storage';
import { UploadService } from 'src/shared/web3storage/upload.service';
import { PolybaseService } from '~/shared/polybase';
import { generateUniqueId } from '~/shared/util/generateUniqueId';
import { CreateItemDto, UpdateItemDto } from './item.dto';
import { Jwt, JwtPayload } from 'jsonwebtoken';
import { UserService } from '../user/user.service';
import { map, without } from 'lodash';

@Injectable()
export class ItemService {
  private readonly db: Polybase;
  private readonly eddiedb: Polybase;
  private readonly itemCollection: Collection<any>;
  private readonly tagCollection: Collection<any>;

  constructor(
    private polybaseService: PolybaseService,
    private uploadService: UploadService,
    private userService: UserService,
  ) {
    this.db = polybaseService.app('bashy');
    this.eddiedb = polybaseService.app('eddie');
    this.itemCollection = this.db.collection('Item');
    this.tagCollection = this.eddiedb.collection('Tag');
  }

  public async recordExists(id: string) {
    const item = await this.itemCollection.record(id).get();
    return item.exists();
  }

  public async findAll(query: any) {
    let reference = await this.itemCollection;
    let builder: any = reference;
    if (query.source) {
      builder = builder
        .where('source', '>=', query.source)
        .where('source', '<', `${query.source}~`);
    }

    // if tags exist, filter results based on tags
    if (query.tags) {
      const tags = query.tags.split(',');
      const { data: raw_items } = await builder.get();

      const items = map(raw_items, function (item) {
        let match = true;
        for (let i in tags) {
          console.log('Tag: ' + i);
          if (!item.data.tags.includes(tags[i])) {
            match = false;
          }
        }
        if (match) {
          return item.data;
        }
      });
      return without(items, undefined);
    }
    // const { data: items } = await this.itemCollection.get();
    const { data: items } = await builder.get();
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

  async uploadToWeb3Storage(
    file: Express.Multer.File,
  ): Promise<{ cid: string; url: string }> {
    const client = new Web3Storage({ token: process.env.WEB3STORAGE_TOKEN });
    try {
      if (!file) {
        throw new HttpException('file not included', HttpStatus.NOT_FOUND);
      }
      // Create a new Blob from the buffer
      const blob = new Blob([file.buffer], { type: file.mimetype });

      // Use the File object from web3.storage
      const filelike = new File([blob], file.originalname);

      const cid = await client.put([filelike]);
      const url = this.generateURLfromCID(cid, file.originalname);

      return { cid, url };
    } catch (error) {
      throw new HttpException('Error uploading to Web3Storage:', error);
    }
  }

  public async create(
    file: Express.Multer.File,
    createItem: CreateItemDto,
    user: JwtPayload,
    project: any, //should have type Project
  ) {
    const LicenseCollection = this.eddiedb.collection('License');

    const id = generateUniqueId();
    const current_time = new Date().toISOString();
    const owner = await this.userService.getUserFromPublicKey(user.sub);
    if (!owner) {
      console.log('No owner');
      throw new UnauthorizedException('Unauthorized');
    }

    const { cid, url } = await this.uploadToWeb3Storage(file);

    const createdItem = await this.itemCollection.create([
      id,
      createItem.title,
      createItem.description,
      url,
      createItem.tags,
      createItem.author,
      this.db.collection('User').record(user.sub),
      project.name,
      this.db.collection('Project').record(project.id),
      createItem.license.join(),
      createItem.license.map((license_id) =>
        LicenseCollection.record(license_id),
      ),
      createItem.price_amount || 0,
      createItem.price_currency || 'none',
      createItem.needsRequest,
      current_time,
      current_time,
    ]);

    return createdItem;
  }

  public async update(
    id: string,
    updateItem: UpdateItemDto,
    user: JwtPayload,
    project: any,
  ) {
    const oldItem = await this.findOne(id);
    const current_time = new Date().toISOString();
    const LicenseCollection = this.eddiedb.collection('License');

    // Check if user is the owner of the item they are trying to update
    const owner = await this.userService.getUserFromPublicKey(user.sub);
    if (oldItem.owner.id !== owner.id) {
      throw new UnauthorizedException('Unathorized request to resource');
    }

    let licenseReference;
    if (updateItem.license) {
      licenseReference = updateItem.license.map((license_id) =>
        LicenseCollection.record(license_id),
      );
    } else {
      licenseReference = oldItem.license.reference;
    }

    const updatedItem = await this.itemCollection.record(id).call('update', [
      updateItem.title || oldItem.title,
      updateItem.description || oldItem.description,
      updateItem.tags || oldItem.tags,
      updateItem.author || oldItem.author,
      updateItem.source || oldItem.source,
      // project.name || oldItem.project.name,
      updateItem?.license?.join() || oldItem.license.name,
      licenseReference,
      updateItem?.price?.amount || oldItem.price.amount,
      updateItem?.price?.currency || oldItem.price.currency,
      updateItem.needsRequest || oldItem.needsRequest,
      current_time,
    ]);

    return this.findOne(id);
  }

  public async remove(id: string, user: JwtPayload) {
    // Check if user is the owner of the item they are trying to delete
    const owner = await this.userService.getUserFromPublicKey(user.sub);
    const oldItem = await this.findOne(id);
    if (oldItem.owner.id !== owner.id) {
      throw new UnauthorizedException('Unathorized request to resource');
    }
    try {
      await this.itemCollection.record(id).call('del');
    } catch (error) {
      switch (error.code) {
        case 'not-found':
          throw new HttpException('record not found', HttpStatus.NOT_FOUND);
        default:
          console.log(error);
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
