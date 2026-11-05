import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { beforeEach, describe, expect, it } from 'vitest';
import { UsersService } from '../users/users.service.js';
import { AuthService } from './auth.service.js';
import { TokenBlacklistService } from './services/token-blacklist.service.js';

describe('AuthService', () => {
  let authService: AuthService;
  let usersService: UsersService;
  let jwtService: JwtService;
  let blacklistService: TokenBlacklistService;

  beforeEach(() => {
    usersService = new UsersService();
    jwtService = new JwtService({ secret: 'test-secret' });
    blacklistService = new TokenBlacklistService();
    authService = new AuthService(usersService, jwtService, blacklistService);
  });

  describe('register', () => {
    it('should register a new user and return token and safe user', async () => {
      const result = await authService.register({
        email: 'test@example.com',
        password: 'password123',
        name: 'Nguyen Van A',
      });

      expect(result.message).toBe('Đăng ký tài khoản thành công');
      expect(result.access_token).toBeDefined();
      expect(result.user.email).toBe('test@example.com');
      expect((result.user as any).password).toBeUndefined();
    });

    it('should throw ConflictException when email is already registered', async () => {
      await authService.register({
        email: 'duplicate@example.com',
        password: 'password123',
        name: 'User 1',
      });

      await expect(
        authService.register({
          email: 'duplicate@example.com',
          password: 'password456',
          name: 'User 2',
        }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('login', () => {
    beforeEach(async () => {
      await authService.register({
        email: 'login@example.com',
        password: 'correctpassword',
        name: 'Login User',
      });
    });

    it('should login successfully with correct credentials', async () => {
      const result = await authService.login({
        email: 'login@example.com',
        password: 'correctpassword',
      });

      expect(result.message).toBe('Đăng nhập thành công');
      expect(result.access_token).toBeDefined();
      expect(result.user.email).toBe('login@example.com');
    });

    it('should throw UnauthorizedException with wrong password', async () => {
      await expect(
        authService.login({
          email: 'login@example.com',
          password: 'wrongpassword',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException with non-existent email', async () => {
      await expect(
        authService.login({
          email: 'notfound@example.com',
          password: 'somepassword',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('logout', () => {
    it('should revoke the token on logout', async () => {
      const token = 'sample-access-token';
      const result = await authService.logout(token);

      expect(result.message).toBe('Đăng xuất thành công');
      expect(blacklistService.isRevoked(token)).toBe(true);
    });
  });
});
