import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Polybase, Collection } from '@polybase/client';
import { PolybaseService } from '~/shared/polybase';
import { getSignerData } from '~/shared/util/getSignerData';

@Injectable()
export class UserService {
  private readonly db: Polybase;
  private readonly userCollection: Collection<any>;

  constructor(private polybaseService: PolybaseService) {
    this.db = polybaseService.app('bashy');
    this.userCollection = this.db.collection('User');
  }
  async createUser(
    publicKey,
    address,
    name,
  ): Promise<{ message: string; user }> {
    const existingUser = await this.userCollection
      .where('address', '==', address)
      .get();
    if (existingUser.data.length > 0) {
      return {
        message: 'This address is already registered to Arttribute',
        user: existingUser.data[0].data,
      };
    }
    const createdUser = await this.userCollection.create([
      publicKey,
      publicKey,
      address,
      name,
      new Date().toISOString(),
    ]);
    return { message: 'User created successfully', user: createdUser.data };
  }

  public async getUserFromPublicKey(publicKey: string) {
    const user = await this.db
      .collection('User')
      .where('publicKey', '==', publicKey)
      .get();

    if (user.data.length > 0) {
      return user.data[0].data;
    } else {
      return null;
    }
  }
}
