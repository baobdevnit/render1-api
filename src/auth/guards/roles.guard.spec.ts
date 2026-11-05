import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { describe, expect, it, vi } from 'vitest';
import { ROLES_KEY } from '../decorators/roles.decorator.js';
import { RolesGuard } from './roles.guard.js';

describe('RolesGuard', () => {
  const createMockContext = (user?: any) => {
    const request = { user };
    const context = {
      switchToHttp: () => ({
        getRequest: () => request,
      }),
      getHandler: () => ({}),
      getClass: () => ({}),
    } as unknown as ExecutionContext;

    return { context, request };
  };

  it('should allow access if no roles are required', () => {
    const getAllAndOverrideMock = vi.fn().mockReturnValue(undefined);
    const reflector = {
      getAllAndOverride: getAllAndOverrideMock,
    } as unknown as Reflector;

    const guard = new RolesGuard(reflector);
    const { context } = createMockContext({ role: 'user' });

    expect(guard.canActivate(context)).toBe(true);
  });

  it('should allow access if user has required role', () => {
    const getAllAndOverrideMock = vi.fn().mockReturnValue(['admin']);
    const reflector = {
      getAllAndOverride: getAllAndOverrideMock,
    } as unknown as Reflector;

    const guard = new RolesGuard(reflector);
    const { context } = createMockContext({ role: 'admin' });

    expect(guard.canActivate(context)).toBe(true);
    expect(getAllAndOverrideMock).toHaveBeenCalledWith(ROLES_KEY, [
      expect.anything(),
      expect.anything(),
    ]);
  });

  it('should throw ForbiddenException if user has different role', () => {
    const getAllAndOverrideMock = vi.fn().mockReturnValue(['admin']);
    const reflector = {
      getAllAndOverride: getAllAndOverrideMock,
    } as unknown as Reflector;

    const guard = new RolesGuard(reflector);
    const { context } = createMockContext({ role: 'user' });

    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
  });

  it('should throw ForbiddenException if request has no user', () => {
    const getAllAndOverrideMock = vi.fn().mockReturnValue(['admin']);
    const reflector = {
      getAllAndOverride: getAllAndOverrideMock,
    } as unknown as Reflector;

    const guard = new RolesGuard(reflector);
    const { context } = createMockContext(undefined);

    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
  });
});
