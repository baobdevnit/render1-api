import type { UserRole } from '../entities/user.entity.js';

export class CreateUserDto {
  email: string;
  name: string;
  password: string;
  role?: UserRole;
}
