import {
  Injectable,
  InternalServerErrorException,
  Logger,
  Optional,
} from '@nestjs/common';
import bcrypt from 'bcryptjs';
import { randomUUID } from 'node:crypto';
import { SupabaseService } from '../supabase/supabase.service.js';
import type { CreateUserDto } from './dto/create-user.dto.js';
import type { SafeUser, User, UserRole } from './entities/user.entity.js';

interface DbUserRow {
  id: string;
  email: string;
  name: string;
  password: string;
  role?: string;
  created_at: string;
  updated_at: string;
}

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);
  private readonly inMemoryUsers: User[] = [];
  private readonly roleOverrides = new Map<string, UserRole>();
  private hasRoleColumn: boolean | null = null;

  constructor(@Optional() private readonly supabaseService?: SupabaseService) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const email = createUserDto.email.trim().toLowerCase();
    const name = createUserDto.name.trim();
    const role: UserRole = createUserDto.role || 'user';

    if (this.supabaseService) {
      const payload: Record<string, any> = {
        email,
        name,
        password: createUserDto.password,
      };

      if (this.hasRoleColumn !== false) {
        payload.role = role;
      }

      let res = await this.supabaseService
        .getClient()
        .from('users')
        .insert(payload)
        .select()
        .single();

      if (
        res.error &&
        res.error.message.includes("Could not find the 'role' column")
      ) {
        this.hasRoleColumn = false;
        this.logger.warn(
          "Cột 'role' chưa tồn tại trên Supabase bảng 'users'. Đang chuyển sang chế độ tương thích. Hãy chạy script trong supabase-schema.sql trên Supabase SQL Editor.",
        );
        delete payload.role;
        res = await this.supabaseService
          .getClient()
          .from('users')
          .insert(payload)
          .select()
          .single();
      }

      if (res.error || !res.data) {
        this.logger.error(
          `Lỗi khi tạo user trên Supabase: ${res.error?.message}`,
        );
        throw new InternalServerErrorException(
          `Không thể tạo người dùng: ${res.error?.message || 'Lỗi không xác định'}`,
        );
      }

      if (this.hasRoleColumn !== false) {
        this.hasRoleColumn = true;
      } else {
        this.roleOverrides.set((res.data as DbUserRow).id, role);
        this.roleOverrides.set(email, role);
      }

      return this.mapToUser(res.data as DbUserRow);
    }

    // Fallback in-memory khi không có SupabaseService (phục vụ unit test độc lập)
    const newUser: User = {
      id: randomUUID(),
      email,
      name,
      password: createUserDto.password,
      role,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.inMemoryUsers.push(newUser);
    return newUser;
  }

  async findByEmail(email: string): Promise<User | undefined> {
    const normalizedEmail = email.trim().toLowerCase();

    if (this.supabaseService) {
      const { data, error } = await this.supabaseService
        .getClient()
        .from('users')
        .select('*')
        .ilike('email', normalizedEmail)
        .maybeSingle();

      if (error) {
        this.logger.error(
          `Lỗi khi tìm user theo email trên Supabase: ${error.message}`,
        );
        throw new InternalServerErrorException(
          `Lỗi truy vấn cơ sở dữ liệu: ${error.message}`,
        );
      }

      return data ? this.mapToUser(data as DbUserRow) : undefined;
    }

    return this.inMemoryUsers.find(
      (user) => user.email.toLowerCase() === normalizedEmail,
    );
  }

  async findById(id: string): Promise<User | undefined> {
    if (this.supabaseService) {
      const { data, error } = await this.supabaseService
        .getClient()
        .from('users')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) {
        this.logger.error(
          `Lỗi khi tìm user theo id trên Supabase: ${error.message}`,
        );
        throw new InternalServerErrorException(
          `Lỗi truy vấn cơ sở dữ liệu: ${error.message}`,
        );
      }

      return data ? this.mapToUser(data as DbUserRow) : undefined;
    }

    return this.inMemoryUsers.find((user) => user.id === id);
  }

  async findAll(): Promise<SafeUser[]> {
    if (this.supabaseService) {
      const { data, error } = await this.supabaseService
        .getClient()
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        this.logger.error(
          `Lỗi khi lấy danh sách user trên Supabase: ${error.message}`,
        );
        throw new InternalServerErrorException(
          `Lỗi truy vấn cơ sở dữ liệu: ${error.message}`,
        );
      }

      return (data || []).map((row) =>
        this.removePassword(this.mapToUser(row as DbUserRow)),
      );
    }

    return this.inMemoryUsers.map((user) => this.removePassword(user));
  }

  async updateRole(id: string, role: UserRole): Promise<User | undefined> {
    if (this.supabaseService) {
      if (this.hasRoleColumn !== false) {
        const { data, error } = await this.supabaseService
          .getClient()
          .from('users')
          .update({ role })
          .eq('id', id)
          .select()
          .maybeSingle();

        if (error) {
          if (error.message.includes("Could not find the 'role' column")) {
            this.hasRoleColumn = false;
            this.logger.warn(
              "Cột 'role' chưa tồn tại trên Supabase bảng 'users'. Chuyển sang lưu role trong bộ nhớ tạm thời.",
            );
          } else {
            this.logger.error(
              `Lỗi khi cập nhật role user trên Supabase: ${error.message}`,
            );
            throw new InternalServerErrorException(
              `Lỗi truy vấn cơ sở dữ liệu: ${error.message}`,
            );
          }
        } else if (data) {
          this.hasRoleColumn = true;
          return this.mapToUser(data as DbUserRow);
        }
      }

      this.roleOverrides.set(id, role);
      const user = await this.findById(id);
      return user;
    }

    const user = this.inMemoryUsers.find((u) => u.id === id);
    if (user) {
      user.role = role;
      user.updatedAt = new Date();
      return user;
    }

    return undefined;
  }

  async seedAdmin(options?: {
    email?: string;
    password?: string;
    name?: string;
  }): Promise<SafeUser> {
    const email = (
      options?.email ||
      process.env.ADMIN_EMAIL ||
      'admin@example.com'
    )
      .trim()
      .toLowerCase();
    const rawPassword =
      options?.password || process.env.ADMIN_PASSWORD || 'Admin@123456';
    const name = (
      options?.name ||
      process.env.ADMIN_NAME ||
      'System Administrator'
    ).trim();

    const existingUser = await this.findByEmail(email);
    if (existingUser) {
      if (existingUser.role !== 'admin') {
        const updated = await this.updateRole(existingUser.id, 'admin');
        return this.removePassword(
          updated || { ...existingUser, role: 'admin' },
        );
      }
      return this.removePassword(existingUser);
    }

    const hashedPassword = await bcrypt.hash(rawPassword, 10);
    const created = await this.create({
      email,
      name,
      password: hashedPassword,
      role: 'admin',
    });

    return this.removePassword(created);
  }

  removePassword(user: User): SafeUser {
    const { password: _password, ...safeUser } = user;
    return safeUser;
  }

  private mapToUser(row: DbUserRow): User {
    const overrideRole =
      this.roleOverrides.get(row.id) ||
      this.roleOverrides.get(row.email.toLowerCase());

    return {
      id: row.id,
      email: row.email,
      name: row.name,
      password: row.password,
      role: (row.role as UserRole) || overrideRole || 'user',
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
  }
}
