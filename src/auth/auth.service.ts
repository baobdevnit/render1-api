import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import bcrypt from 'bcryptjs';
import { UsersService } from '../users/users.service.js';
import type { LoginDto } from './dto/login.dto.js';
import type { RegisterDto } from './dto/register.dto.js';
import { TokenBlacklistService } from './services/token-blacklist.service.js';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly tokenBlacklistService: TokenBlacklistService,
  ) {}

  async register(registerDto: RegisterDto) {
    const existing = await this.usersService.findByEmail(registerDto.email);
    if (existing) {
      throw new ConflictException('Email này đã được sử dụng');
    }

    const hashedPassword = await bcrypt.hash(registerDto.password, 10);
    const user = await this.usersService.create({
      email: registerDto.email,
      name: registerDto.name,
      password: hashedPassword,
    });

    const payload = { sub: user.id, email: user.email, role: user.role };
    const accessToken = await this.jwtService.signAsync(payload);
    const safeUser = this.usersService.removePassword(user);

    return {
      message: 'Đăng ký tài khoản thành công',
      user: safeUser,
      access_token: accessToken,
      token_type: 'Bearer',
    };
  }

  async login(loginDto: LoginDto) {
    const user = await this.usersService.findByEmail(loginDto.email);
    if (!user) {
      throw new UnauthorizedException('Email hoặc mật khẩu không chính xác');
    }

    const isMatch = await bcrypt.compare(loginDto.password, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('Email hoặc mật khẩu không chính xác');
    }

    const payload = { sub: user.id, email: user.email, role: user.role };
    const accessToken = await this.jwtService.signAsync(payload);
    const safeUser = this.usersService.removePassword(user);

    return {
      message: 'Đăng nhập thành công',
      access_token: accessToken,
      token_type: 'Bearer',
      user: safeUser,
    };
  }

  async logout(token: string, payload?: { exp?: number }) {
    const expiresAtMs = payload?.exp ? payload.exp * 1000 : undefined;
    this.tokenBlacklistService.revoke(token, expiresAtMs);

    return {
      message: 'Đăng xuất thành công',
    };
  }
}
