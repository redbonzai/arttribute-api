import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthService } from '../auth.service';
import { JwtAuthGuard } from './jwt.guard';
import { ApiKeyAuthGuard } from './api-key.guard';
import { map, some } from 'lodash';

@Injectable()
export class AnyAuthGuard implements CanActivate {
  private jwtAuthGuard: JwtAuthGuard;
  private apiAuthGuard: ApiKeyAuthGuard;

  constructor(
    private reflector: Reflector,
    private authService: AuthService,
  ) {
    this.jwtAuthGuard = new JwtAuthGuard(reflector, authService);
    this.apiAuthGuard = new ApiKeyAuthGuard(reflector, authService);
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const guardsSettled = await Promise.allSettled(
      map([this.jwtAuthGuard, this.apiAuthGuard], (guard) =>
        guard.canActivate(context),
      ),
    );

    return some(guardsSettled, (result) => {
      if (result.status == 'fulfilled') {
        return result.value;
      }
    });
  }
}
