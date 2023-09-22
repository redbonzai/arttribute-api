import { ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { find, map, some } from 'lodash';
import { AuthService } from '../auth.service';
import { AllAuthGuard } from './all.guard';

@Injectable()
export class AnyAuthGuard extends AllAuthGuard {
  constructor(
    protected reflector: Reflector,
    protected authService: AuthService,
  ) {
    super(reflector, authService);
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const guardsSettled = await Promise.allSettled(
      map(this.guards, (guard) => guard.canActivate(context)),
    );

    const isValid = some(guardsSettled, (result) => {
      if (result.status == 'fulfilled') {
        return result.value;
      }
    });

    if (isValid) {
      return isValid;
    }
    throw (
      find(guardsSettled, {
        'status': 'rejected',
      }) as PromiseRejectedResult
    ).reason;
  }
}
