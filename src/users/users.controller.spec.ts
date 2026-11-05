import { describe, expect, it, vi } from 'vitest';
import type { SafeUser } from './entities/user.entity.js';
import { UsersController } from './users.controller.js';
import type { UsersService } from './users.service.js';

describe('UsersController', () => {
  it('should call findAll on UsersService and return list of users', async () => {
    const mockUsers: SafeUser[] = [
      {
        id: '1',
        email: 'admin@example.com',
        name: 'Admin User',
        role: 'admin',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: '2',
        email: 'user@example.com',
        name: 'Regular User',
        role: 'user',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    const findAllMock = vi.fn().mockResolvedValue(mockUsers);
    const mockUsersService = {
      findAll: findAllMock,
    } as unknown as UsersService;

    const controller = new UsersController(mockUsersService);
    const result = await controller.findAll();

    expect(findAllMock).toHaveBeenCalled();
    expect(result).toHaveLength(2);
    expect(result[0].role).toBe('admin');
    expect(result[1].role).toBe('user');
  });
});
