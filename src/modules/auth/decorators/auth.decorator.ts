import { UseGuards } from '@nestjs/common';
import { map, uniq } from 'lodash';
import { APIKeyAuthGuard, JwtAuthGuard } from '../guards';

export type AuthScope = 'api-key' | 'jwt';

const AuthScopeMap: Record<AuthScope, any> = {
  'api-key': APIKeyAuthGuard,
  'jwt': JwtAuthGuard,
};

export function Auth(...scopes: AuthScope[]): MethodDecorator {
  const uniqueScopes = uniq(scopes);
  return UseGuards(...map(uniqueScopes, (scope) => AuthScopeMap[scope]));
}
