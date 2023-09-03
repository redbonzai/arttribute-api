import {
  Injectable,
  UnauthorizedException,
  HttpException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Polybase, Collection } from '@polybase/client';
import { first } from 'lodash';
import { PolybaseService } from '~/shared/polybase';
import { getSignerData } from '~/shared/util/getSignerData';

@Injectable()
export class AuthService {
  private readonly db: Polybase;
  private readonly userCollection: Collection<any>;

  constructor(
    private readonly jwtService: JwtService,
    private polybaseService: PolybaseService,
  ) {
    this.db = polybaseService.app('bashy');
    this.userCollection = this.db.collection('User');
  }

  async authenticate(
    address: string,
    message: string,
    signature: string,
  ): Promise<{ token: string; publicKey: string }> {
    try {
      const { recoveredAddress, publicKey } = getSignerData(message, signature);
      if (recoveredAddress.toLowerCase() !== address.toLowerCase()) {
        throw new UnauthorizedException('Signature does not match!');
      }
      const existingUser = await this.userCollection
        .where('address', '==', address)
        .get();
      if (!first(existingUser.data)?.data) {
        throw new UnauthorizedException('User does not exist!');
      }
      const token = this.jwtService.sign({ address, publicKey });
      return { token, publicKey };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      console.log(error);
      throw new UnauthorizedException('Authentication failed');
    }
  }
}

