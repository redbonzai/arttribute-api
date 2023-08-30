import { Injectable } from '@nestjs/common';
import { Polybase, Collection } from '@polybase/client';
import { PolybaseService } from '~/shared/polybase';
import { generateUniqueId } from '~/shared/util/generateUniqueId';

@Injectable()
export class UserService {
  private readonly db: Polybase;
  private readonly userCollection: Collection<any>;

  constructor(private polybaseService: PolybaseService) {
    this.db = polybaseService.app('bashy');
    this.userCollection = this.db.collection('User');
  }
  public async create(user) {
    const createdUser = await this.userCollection.create([
      generateUniqueId(),
      user.name,
    ]);
    return createdUser;
  }
}
