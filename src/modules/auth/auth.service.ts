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
      if (signer.toLowerCase() !== address.toLowerCase()) {
        throw new UnauthorizedException('Signature does not match!');
      }
      return this.jwtService.sign(JSON.stringify({ sub: address }));
      return jwt.sign({ address }, this.JWT_SECRET, { expiresIn: '1d' });
    } catch (error) {
      throw new UnauthorizedException('Authentication failed.');
    }
  }
}
