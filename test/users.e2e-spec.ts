import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types.js';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { AppModule } from '../src/app.module.js';
import { UsersService } from '../src/users/users.service.js';

describe('Admin Users List Flow (e2e)', () => {
  let app: INestApplication<App>;
  let usersService: UsersService;
  let userToken: string;
  let adminToken: string;

  const normalUser = {
    email: `normal.${Date.now()}@example.com`,
    password: 'password123',
    name: 'Normal User',
  };

  const adminEmail = `admin.${Date.now()}@example.com`;
  const adminPassword = 'AdminSecret123!';

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();

    usersService = app.get(UsersService);

    // 1. Tạo user thông thường qua API register
    const regRes = await request(app.getHttpServer())
      .post('/auth/register')
      .send(normalUser);
    userToken = regRes.body.access_token;

    // 2. Tạo tài khoản Admin thông qua tính năng SEED
    await usersService.seedAdmin({
      email: adminEmail,
      password: adminPassword,
      name: 'Seeded Admin User',
    });

    // 3. Đăng nhập với tài khoản Admin vừa seed để lấy adminToken
    const adminLoginRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: adminEmail,
        password: adminPassword,
      });
    adminToken = adminLoginRes.body.access_token;
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /users - 401 khi chưa đăng nhập (không có token)', async () => {
    const res = await request(app.getHttpServer()).get('/users');
    expect(res.status).toBe(401);
  });

  it('GET /users - 403 Forbidden khi user thông thường truy cập (không có quyền admin)', async () => {
    const res = await request(app.getHttpServer())
      .get('/users')
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(403);
    expect(res.body.message).toContain('Admin');
  });

  it('GET /users - 200 OK khi Admin truy cập xem danh sách người dùng đã đăng ký', async () => {
    const res = await request(app.getHttpServer())
      .get('/users')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThanOrEqual(2);

    // Kiểm tra không lộ trường mật khẩu
    for (const u of res.body) {
      expect(u.password).toBeUndefined();
      expect(u).toHaveProperty('id');
      expect(u).toHaveProperty('email');
      expect(u).toHaveProperty('name');
      expect(u).toHaveProperty('role');
    }

    const foundAdmin = res.body.find((u: any) => u.email === adminEmail);
    expect(foundAdmin).toBeDefined();
    expect(foundAdmin.role).toBe('admin');

    const foundNormal = res.body.find((u: any) => u.email === normalUser.email);
    expect(foundNormal).toBeDefined();
    expect(foundNormal.role).toBe('user');
  });

  it('GET /admin/users - 200 OK với alias route cho admin', async () => {
    const res = await request(app.getHttpServer())
      .get('/admin/users')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});
