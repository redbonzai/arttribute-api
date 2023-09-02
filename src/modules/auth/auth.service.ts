import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ethers } from 'ethers';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}
  private readonly JWT_SECRET = 'YOUR_SECRET_FOR_JWT';

  async authenticate(
    address: string,
    message: string,
    signature: string,
  ): Promise<string> {
    try {
      const signer = ethers.verifyMessage(message, signature);
      console.log(signer);
      if (signer.toLowerCase() !== address.toLowerCase()) {
        throw new UnauthorizedException('Signature does not match!');
        // const publicKey = ethPersonalSignRecoverPublicKey(signature, message);
        // userService.getUser(publicKey)
      }
      return this.jwtService.sign({ sub: address });
      return jwt.sign({ address }, this.JWT_SECRET, { expiresIn: '1d' });
    } catch (error) {
      throw new UnauthorizedException('Authentication failed.');
    }
  }
}
