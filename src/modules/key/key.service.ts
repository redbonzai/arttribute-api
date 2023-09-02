import { Injectable } from '@nestjs/common';
import { KeyDto } from './key.dto';
import { Collection, Polybase } from '@polybase/client';
import { generateUniqueId } from '~/shared/util/generateUniqueId';
import { PolybaseService } from '~/shared/polybase';
import { v4 as uuidv4 } from 'uuid';
import * as bycrypt from 'bcrypt';
import * as nanoid from 'nanoid';

@Injectable()
export class KeyService {
  db: Polybase;
  collection: Collection<any>;

  constructor(private polybaseService: PolybaseService) {
    this.db = polybaseService.app('bashy');
    this.collection = this.db.collection('ApiKey');
  }

  async createKey(keyDto: KeyDto, userId: string) {
    const createdAt = new Date().toISOString();
    const genrateprefix = nanoid.customAlphabet(
      'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ',
      7,
    );
    const generatevalue = nanoid.customAlphabet(
      'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789',
      32,
    );
    const keyprefix = genrateprefix();
    const value = generatevalue();
    const hashedValue = await bycrypt.hash(value, 10);

    const key = await this.collection.create([
      generateUniqueId(),
      this.db.collection('User').record(userId),
      keyprefix,
      hashedValue,
      keyDto.name,
      keyDto.url,
      createdAt,
    ]);
    return { data: key.data, apikey: `${keyprefix}.${value}` };
  }
}

