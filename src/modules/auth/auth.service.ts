import {
  Injectable,
  UnauthorizedException,
  HttpException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ethers } from 'ethers';
import * as jwt from 'jsonwebtoken';
import { ethPersonalSignRecoverPublicKey } from '@polybase/eth';

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}

  async authenticate(
    address: string,
    message: string,
    signature: string,
  ): Promise<string> {
    try {
      const signer = ethers.verifyMessage(message, signature);
      if (signer.toLowerCase() !== address.toLowerCase()) {
        throw new UnauthorizedException('Signature does not match!');
      }
      const publicKey = ethPersonalSignRecoverPublicKey(signature, message);
      // TODO: Check if publicKey exists
      return this.jwtService.sign({ sub: publicKey });
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      console.log(error);
      throw new UnauthorizedException('Authentication failed.');
    }
  }

  public decodeJwt(jwt: string) {
    try {
      const decodedJwt: jwt.JwtPayload = this.jwtService.decode(
        jwt,
      ) as jwt.JwtPayload;
      return decodedJwt;
    } catch (error) {
      throw new UnauthorizedException('Invalid Token');
    }
  }
}
