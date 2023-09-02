import {
  Injectable,
  HttpException,
  HttpStatus,
  UnauthorizedException,
} from '@nestjs/common';
import { Polybase, Collection } from '@polybase/client';
import { CIDString, Web3Storage, getFilesFromPath } from 'web3.storage';
import { UploadService } from 'src/shared/web3storage/upload.service';
import { PolybaseService } from '~/shared/polybase';
import { generateUniqueId } from '~/shared/util/generateUniqueId';
import { CreateItemDto, UpdateItemDto } from './item.dto';
import { Jwt, JwtPayload } from 'jsonwebtoken';
import { UserService } from '../user/user.service';

@Injectable()
export class ItemService {
  private readonly db: Polybase;
  private readonly itemCollection: Collection<any>;

  constructor(
    private polybaseService: PolybaseService,
    private uploadService: UploadService,
    private userService: UserService,
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

  public async create(
    createItem: CreateItemDto,
    file: Express.Multer.File,
    user: JwtPayload,
  ) {
    const filePath = file.destination + '/' + file.filename;
    const uploadFile = await getFilesFromPath([filePath]);
    const cid: CIDString = await this.uploadService.upload(uploadFile);
    const LicenseCollection = this.db.collection('License');
    const url = this.generateURLfromCID(cid, file.filename);

    const id = generateUniqueId();
    const current_time = new Date().toISOString();
    const owner = await this.userService.getUserFromPublicKey(user.sub);
    if (!owner) {
      console.log('No owner');
      throw new UnauthorizedException('Unauthorized');
    }

    const createdItem = await this.itemCollection.create([
      id,
      createItem.title,
      createItem.description,
      url,
      createItem.tags,
      createItem.author,
      this.db.collection('User').record(owner.id),
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
    if (!(await this.recordExists(id))) {
      throw new HttpException('record not found', HttpStatus.NOT_FOUND);
    }
    const current_time = new Date().toISOString();
    const LicenseCollection = this.db.collection('License');
    const oldItem = await this.itemCollection.record(id).get();

    // Check if user is the owner of the item they are trying to update
    const owner = await this.userService.getUserFromPublicKey(user.sub);
    if (oldItem.data.owner.id !== owner.id) {
      throw new UnauthorizedException('Unathorized request to resource');
    }

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
  }

  public async remove(id: string, user: JwtPayload) {
    // Check if user is the owner of the item they are trying to delete
    const owner = await this.userService.getUserFromPublicKey(user.sub);
    const oldItem = await this.itemCollection.record(id).get();
    if (oldItem.data.owner.id !== owner.id) {
      throw new UnauthorizedException('Unathorized request to resource');
    }
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
