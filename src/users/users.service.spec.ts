import { InternalServerErrorException } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';
import type { SupabaseService } from '../supabase/supabase.service.js';
import { UsersService } from './users.service.js';

describe('UsersService', () => {
  describe('In-memory mode (without Supabase)', () => {
    it('should create and retrieve users with default role "user"', async () => {
      const service = new UsersService();

      const created = await service.create({
        email: 'test@example.com',
        name: 'John Doe',
        password: 'hashed-password',
      });

      expect(created.id).toBeDefined();
      expect(created.email).toBe('test@example.com');
      expect(created.name).toBe('John Doe');
      expect(created.role).toBe('user');

      const byEmail = await service.findByEmail('TEST@example.com');
      expect(byEmail).toBeDefined();
      expect(byEmail?.id).toBe(created.id);
      expect(byEmail?.role).toBe('user');

      const byId = await service.findById(created.id);
      expect(byId).toBeDefined();
      expect(byId?.email).toBe('test@example.com');

      const safeUser = service.removePassword(created);
      expect((safeUser as any).password).toBeUndefined();
      expect(safeUser.email).toBe('test@example.com');
      expect(safeUser.role).toBe('user');
    });

    it('should list all registered users without passwords', async () => {
      const service = new UsersService();

      await service.create({
        email: 'user1@example.com',
        name: 'User One',
        password: 'hash1',
      });

      await service.create({
        email: 'admin@example.com',
        name: 'Admin One',
        password: 'hash2',
        role: 'admin',
      });

      const users = await service.findAll();
      expect(users).toHaveLength(2);
      expect(users[0].email).toBe('user1@example.com');
      expect((users[0] as any).password).toBeUndefined();
      expect(users[1].email).toBe('admin@example.com');
      expect(users[1].role).toBe('admin');
      expect((users[1] as any).password).toBeUndefined();
    });

    it('should update user role', async () => {
      const service = new UsersService();

      const user = await service.create({
        email: 'promoted@example.com',
        name: 'To Be Admin',
        password: 'hash',
      });
      expect(user.role).toBe('user');

      const updated = await service.updateRole(user.id, 'admin');
      expect(updated).toBeDefined();
      expect(updated?.role).toBe('admin');

      const fetched = await service.findById(user.id);
      expect(fetched?.role).toBe('admin');
    });

    it('should seed admin user when user does not exist', async () => {
      const service = new UsersService();

      const seeded = await service.seedAdmin({
        email: 'admin@system.local',
        password: 'AdminPassword123!',
        name: 'Super Admin',
      });

      expect(seeded.email).toBe('admin@system.local');
      expect(seeded.role).toBe('admin');
      expect(seeded.name).toBe('Super Admin');
      expect((seeded as any).password).toBeUndefined();

      const found = await service.findByEmail('admin@system.local');
      expect(found).toBeDefined();
      expect(found?.role).toBe('admin');
    });

    it('should promote existing user to admin on seedAdmin', async () => {
      const service = new UsersService();

      await service.create({
        email: 'existing@system.local',
        password: 'hashed-old-pass',
        name: 'Existing User',
        role: 'user',
      });

      const seeded = await service.seedAdmin({
        email: 'existing@system.local',
      });

      expect(seeded.email).toBe('existing@system.local');
      expect(seeded.role).toBe('admin');
    });
  });

  describe('Supabase mode', () => {
    const mockDbRow = {
      id: 'uuid-1234',
      email: 'supa@example.com',
      name: 'Supa User',
      password: 'hashed-password',
      role: 'admin',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    it('should create user using Supabase client with role', async () => {
      const singleMock = vi
        .fn()
        .mockResolvedValue({ data: mockDbRow, error: null });
      const selectMock = vi.fn().mockReturnValue({ single: singleMock });
      const insertMock = vi.fn().mockReturnValue({ select: selectMock });
      const fromMock = vi.fn().mockReturnValue({ insert: insertMock });

      const mockSupabaseService = {
        getClient: vi.fn().mockReturnValue({
          from: fromMock,
        }),
      } as unknown as SupabaseService;

      const service = new UsersService(mockSupabaseService);

      const created = await service.create({
        email: 'supa@example.com',
        name: 'Supa User',
        password: 'hashed-password',
        role: 'admin',
      });

      expect(fromMock).toHaveBeenCalledWith('users');
      expect(created.id).toBe('uuid-1234');
      expect(created.email).toBe('supa@example.com');
      expect(created.role).toBe('admin');
    });

    it('should find user by email using Supabase client', async () => {
      const maybeSingleMock = vi
        .fn()
        .mockResolvedValue({ data: mockDbRow, error: null });
      const ilikeMock = vi
        .fn()
        .mockReturnValue({ maybeSingle: maybeSingleMock });
      const selectMock = vi.fn().mockReturnValue({ ilike: ilikeMock });
      const fromMock = vi.fn().mockReturnValue({ select: selectMock });

      const mockSupabaseService = {
        getClient: vi.fn().mockReturnValue({
          from: fromMock,
        }),
      } as unknown as SupabaseService;

      const service = new UsersService(mockSupabaseService);

      const user = await service.findByEmail('supa@example.com');
      expect(user).toBeDefined();
      expect(user?.email).toBe('supa@example.com');
      expect(user?.role).toBe('admin');
      expect(ilikeMock).toHaveBeenCalledWith('email', 'supa@example.com');
    });

    it('should return all users using Supabase client', async () => {
      const orderMock = vi
        .fn()
        .mockResolvedValue({ data: [mockDbRow], error: null });
      const selectMock = vi.fn().mockReturnValue({ order: orderMock });
      const fromMock = vi.fn().mockReturnValue({ select: selectMock });

      const mockSupabaseService = {
        getClient: vi.fn().mockReturnValue({
          from: fromMock,
        }),
      } as unknown as SupabaseService;

      const service = new UsersService(mockSupabaseService);
      const users = await service.findAll();

      expect(fromMock).toHaveBeenCalledWith('users');
      expect(users).toHaveLength(1);
      expect(users[0].email).toBe('supa@example.com');
      expect(users[0].role).toBe('admin');
      expect((users[0] as any).password).toBeUndefined();
    });

    it('should update role using Supabase client', async () => {
      const maybeSingleMock = vi
        .fn()
        .mockResolvedValue({ data: mockDbRow, error: null });
      const selectMock = vi
        .fn()
        .mockReturnValue({ maybeSingle: maybeSingleMock });
      const eqMock = vi.fn().mockReturnValue({ select: selectMock });
      const updateMock = vi.fn().mockReturnValue({ eq: eqMock });
      const fromMock = vi.fn().mockReturnValue({ update: updateMock });

      const mockSupabaseService = {
        getClient: vi.fn().mockReturnValue({
          from: fromMock,
        }),
      } as unknown as SupabaseService;

      const service = new UsersService(mockSupabaseService);
      const result = await service.updateRole('uuid-1234', 'admin');

      expect(fromMock).toHaveBeenCalledWith('users');
      expect(updateMock).toHaveBeenCalledWith({ role: 'admin' });
      expect(eqMock).toHaveBeenCalledWith('id', 'uuid-1234');
      expect(result?.role).toBe('admin');
    });

    it('should throw InternalServerErrorException when Supabase returns an error', async () => {
      const singleMock = vi.fn().mockResolvedValue({
        data: null,
        error: { message: 'Database connection failed' },
      });
      const selectMock = vi.fn().mockReturnValue({ single: singleMock });
      const insertMock = vi.fn().mockReturnValue({ select: selectMock });
      const fromMock = vi.fn().mockReturnValue({ insert: insertMock });

      const mockSupabaseService = {
        getClient: vi.fn().mockReturnValue({
          from: fromMock,
        }),
      } as unknown as SupabaseService;

      const service = new UsersService(mockSupabaseService);

      await expect(
        service.create({
          email: 'error@example.com',
          name: 'Error User',
          password: 'password',
        }),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });
});
