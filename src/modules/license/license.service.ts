import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import db from '../../shared/polybase/initPolybase';
import { Polybase, Collection } from '@polybase/client';
import { LicenseModel } from './license.dto';
import { generateUniqueId } from '~/shared/util/generateUniqueId';
import { PolybaseService } from '~/shared/polybase';

@Injectable()
export class LicenseService {
  private readonly db: Polybase;
  private readonly licenseCollection: Collection<any>;

  constructor(private polybaseService: PolybaseService) {
    this.db = polybaseService.client;
    this.licenseCollection = this.db.collection('License');
  }

  public async findAll() {
    const { data: licenses } = await this.licenseCollection.get();
    return licenses.map((license) => license.data);
  }

  public async findOne(id: string) {
    const { data: item } = await this.licenseCollection.record(id).get();
    if (item) {
      return item;
    } else {
      throw new HttpException('record not found', HttpStatus.NOT_FOUND);
    }
  }

  public async create(createLicense: LicenseModel) {
    const collection = this.db.collection('License');

    const createdLicense = await collection.create([
      createLicense.id,
      createLicense.name,
      createLicense.description,
      createLicense.symbol,
    ]);
    return createdLicense;
  }

  update() {
    return `This action updates an license`;
  }

  public async remove(id: string) {
    try {
      await this.licenseCollection.record(id).call('del');
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
    }
  }
}
