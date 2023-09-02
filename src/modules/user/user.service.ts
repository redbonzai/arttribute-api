import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Polybase, Collection } from '@polybase/client';
import { PolybaseService } from '~/shared/polybase';
import { getSignerData } from '~/shared/util/getSignerData';

@Injectable()
export class UserService {
  private readonly db: Polybase;
  private readonly userCollection: Collection<any>;

  constructor(
    private readonly jwtService: JwtService,
    private polybaseService: PolybaseService,
  ) {
    this.db = polybaseService.app('bashy');
    this.userCollection = this.db.collection('User');
  }
  async createUser(
    address,
    message,
    signature,
    name,
  ): Promise<{ message: string; token: string; user }> {
    const { recoveredAddress, publicKey } = getSignerData(message, signature);
    if (recoveredAddress.toLowerCase() !== address.toLowerCase()) {
      throw new UnauthorizedException('Signature does not match!');
    }
    const token = this.jwtService.sign({ address, publicKey });
    const existingUser = await this.userCollection
      .where('address', '==', address)
      .get();
    if (existingUser.data.length > 0) {
      return {
        message: 'This address is already registered to Arttribute',
        token: token,
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
    return {
      message: 'User created successfully',
      token: token,
      user: createdUser.data,
    };
  }
}

