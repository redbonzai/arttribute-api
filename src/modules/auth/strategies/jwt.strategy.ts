import { ExtractJwt, Strategy } from 'passport-jwt';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { JwtPayload } from 'jsonwebtoken';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  private readonly JWT_SECRET = process.env.JWT_SECRET;
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        ExtractJwt.fromAuthHeaderAsBearerToken(),
        (req) => {
          return req.cookies?.['accessToken'] || null;
        },
      ]),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET,
    });
  }

  // handleRequest(err, user, info) {
  //   if (err || !user) {
  //     throw err || new UnauthorizedException('Invalid token.');
  //   }
  //   return user;
  // }

  validate(payload: JwtPayload) {
    return payload;
    // try {
    //   return jwt.verify(token, this.JWT_SECRET);
    // } catch (error) {
    //   console.log('err');
    //   throw new UnauthorizedException('Invalid token.');
    // }
  }
}

