import { Controller, Get, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { AuthGuard } from '../auth/guards/auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import type { SafeUser } from './entities/user.entity.js';
import { UsersService } from './users.service.js';

@ApiTags('Users')
@Controller(['users', 'admin/users'])
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Xem danh sách người dùng đã đăng ký (Chỉ dành cho Admin)',
  })
  @ApiResponse({
    status: 200,
    description: 'Danh sách người dùng đã đăng ký.',
  })
  @ApiResponse({
    status: 401,
    description: 'Chưa xác thực hoặc token không hợp lệ.',
  })
  @ApiResponse({
    status: 403,
    description: 'Không có quyền truy cập (Yêu cầu tài khoản có cờ Admin).',
  })
  async findAll(): Promise<SafeUser[]> {
    return this.usersService.findAll();
  }
}
