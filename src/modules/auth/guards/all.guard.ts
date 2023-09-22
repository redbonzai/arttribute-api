import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { every, map } from 'lodash';
import { AuthService } from '../auth.service';
import { ApiKeyAuthGuard } from './api-key.guard';
import { JwtAuthGuard } from './jwt.guard';

@Injectable()
export class AllAuthGuard implements CanActivate {
  protected guards: CanActivate[];

  constructor(
    protected reflector: Reflector,
    protected authService: AuthService,
  ) {
    this.guards.push(
      new JwtAuthGuard(reflector, authService),
      new ApiKeyAuthGuard(reflector, authService),
    );
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const guardsSettled = await Promise.allSettled(
      map(this.guards, (guard) => guard.canActivate(context)),
    );

    return every(guardsSettled, (result) => {
      if (result.status == 'fulfilled') {
        return result.value;
      }
    });
  }
}
