import { UseGuards } from '@nestjs/common';
import { map, uniq } from 'lodash';
import { AnyAuthGuard, ApiKeyAuthGuard, JwtAuthGuard } from '../guards';

const authScopes = ['api-key', 'jwt'] as const;
export type AuthScope = (typeof authScopes)[number];

const conditionalAuthScopes = ['any'] as const;
export type ConditionalAuthScope = (typeof conditionalAuthScopes)[number];

const AuthScopeMap: Record<AuthScope | ConditionalAuthScope, any> = {
  'api-key': ApiKeyAuthGuard,
  'jwt': JwtAuthGuard,
  'any': AnyAuthGuard,
};

export function Authentication(scope: ConditionalAuthScope): MethodDecorator;
export function Authentication(...scopes: AuthScope[]): MethodDecorator;
export function Authentication(
  ...scopes: AuthScope[] | ConditionalAuthScope[]
): MethodDecorator {
  const uniqueScopes = uniq(scopes);
  return UseGuards(...map(uniqueScopes, (scope) => AuthScopeMap[scope]));
}
