import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class JwtStrategy extends AuthGuard('jwt') {
  private readonly JWT_SECRET = 'YOUR_SECRET_FOR_JWT';

  handleRequest(err, user, info) {
    if (err || !user) {
      throw err || new UnauthorizedException('Invalid token.');
    }
    return user;
  }

  validate(token) {
    try {
      return jwt.verify(token, this.JWT_SECRET);
    } catch (error) {
      throw new UnauthorizedException('Invalid token.');
    }
  }
}
