import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { beforeEach, describe, expect, it } from 'vitest';
import { UsersService } from '../../users/users.service.js';
import { TokenBlacklistService } from '../services/token-blacklist.service.js';
import { AuthGuard } from './auth.guard.js';

describe('AuthGuard', () => {
  let guard: AuthGuard;
  let jwtService: JwtService;
  let blacklistService: TokenBlacklistService;
  let usersService: UsersService;

  beforeEach(() => {
    jwtService = new JwtService({ secret: 'default-secret-jwt-key' });
    blacklistService = new TokenBlacklistService();
    usersService = new UsersService();
    guard = new AuthGuard(jwtService, blacklistService, usersService);
  });

  const createMockContext = (authHeader?: string) => {
    const request: any = {
      headers: {
        authorization: authHeader,
      },
    };
    const context = {
      switchToHttp: () => ({
        getRequest: () => request,
      }),
    } as unknown as ExecutionContext;

    return { context, request };
  };

  it('should throw UnauthorizedException when no authorization header is present', async () => {
    const { context } = createMockContext();
    await expect(guard.canActivate(context)).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('should throw UnauthorizedException when token is revoked / blacklisted', async () => {
    const token = 'revoked-token';
    blacklistService.revoke(token);
    const { context } = createMockContext(`Bearer ${token}`);

    await expect(guard.canActivate(context)).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('should throw UnauthorizedException when token is invalid', async () => {
    const { context } = createMockContext('Bearer invalid.jwt.token');
    await expect(guard.canActivate(context)).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('should attach user, token and return true for valid token', async () => {
    const user = await usersService.create({
      email: 'valid@example.com',
      name: 'Valid User',
      password: 'hashed-password',
    });

    const token = await jwtService.signAsync(
      { sub: user.id, email: user.email },
      { secret: 'default-secret-jwt-key' },
    );

    const { context, request } = createMockContext(`Bearer ${token}`);
    const result = await guard.canActivate(context);

    expect(result).toBe(true);
    expect(request.user).toBeDefined();
    expect(request.user.id).toBe(user.id);
    expect(request.user.email).toBe('valid@example.com');
    expect(request.token).toBe(token);
  });
});
