import { JwtService } from '@nestjs/jwt';
import { beforeEach, describe, expect, it } from 'vitest';
import { UsersService } from '../users/users.service.js';
import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';
import { TokenBlacklistService } from './services/token-blacklist.service.js';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  beforeEach(() => {
    const usersService = new UsersService();
    const jwtService = new JwtService({ secret: 'test-secret' });
    const blacklistService = new TokenBlacklistService();
    authService = new AuthService(usersService, jwtService, blacklistService);
    controller = new AuthController(authService);
  });

  it('should call register on authService', async () => {
    const res = await controller.register({
      email: 'test@example.com',
      password: 'password123',
      name: 'Test User',
    });

    expect(res.user.email).toBe('test@example.com');
  });

  it('should return user for getProfile and getMe', () => {
    const mockUser = {
      id: '123',
      email: 'test@example.com',
      name: 'Test User',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    expect(controller.getProfile(mockUser)).toEqual(mockUser);
    expect(controller.getMe(mockUser)).toEqual(mockUser);
  });

  it('should logout and return success message', async () => {
    const res = await controller.logout('token-123', {} as any);
    expect(res.message).toBe('Đăng xuất thành công');
  });
});
