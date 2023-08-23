import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { LicenseModel } from './models/license.model';
import db from '../../shared/polybase/initPolybase';
import { Polybase } from '@polybase/client';

@Injectable()
export class LicenseService {
  private readonly db: Polybase;
  constructor() {
    this.db = db;
  }

  findAll() {
    return `This action returns all license`;
  }

  findOne() {
    return `This action returns one license`;
  }

  async create(createLicense: LicenseModel) {
    const collection = this.db.collection('License');
    // Check if code exists in the collection
    const { data, cursor } = await collection
      .where('code', '==', createLicense.code)
      .get();

    if (data.length !== 0) {
      throw new HttpException(
        'license code already exists - value must be unique',
        HttpStatus.CONFLICT,
      );
    } else {
      const createdLicense = await collection.create([
        createLicense.id,
        createLicense.code,
        createLicense.name,
        createLicense.description,
        createLicense.symbol,
      ]);
      return createdLicense;
    }
  }

  update() {
    return `This action updates an license`;
  }

  remove() {
    return `This action removes an license`;
  }
}
