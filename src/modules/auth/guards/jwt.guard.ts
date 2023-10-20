import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { first, get, isObject, startsWith, trim } from 'lodash';
import { AuthService } from '../auth.service';

// @Injectable()
// export class JwtAuthGuard extends AuthGuard('jwt') {}

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private authService: AuthService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<Request>();
    let token = get(req.headers, 'authorization');

    try {
      if ((isObject(token) && (token = first(token))) || !token) {
        throw new BadRequestException('Missing Token');
      }
      if (!startsWith(token, 'Bearer')) {
        throw new BadRequestException('Token is not Bearer');
      }
      token = trim(token.replace('Bearer', ''));

      const user = this.authService.validateToken(token);

      const isValid = Boolean(user);

      if (isValid) {
        (req as any).user = user;
        return true;
      }
      throw new UnauthorizedException();
    } catch (err) {
      console.log(err);
      throw new UnauthorizedException(
        err instanceof BadRequestException ? err.message : undefined,
      );
    }
  }
}
