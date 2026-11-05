import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types.js';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { AppModule } from '../src/app.module.js';

describe('Auth Flow (e2e)', () => {
  let app: INestApplication<App>;

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
  });

  afterAll(async () => {
    await app.close();
  });

  const testUser = {
    email: `user.flow.${Date.now()}@example.com`,
    password: 'securepassword123',
    name: 'Flow User',
  };

  let token: string;

  describe('POST /auth/register (Public)', () => {
    it('should fail with validation error when email is invalid', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'invalid-email',
          password: '123',
          name: '',
        });

      expect(response.status).toBe(400);
    });

    it('should register successfully with valid credentials', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send(testUser);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('access_token');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user.email).toBe(testUser.email);
      expect(response.body.user.name).toBe(testUser.name);
      expect(response.body.user.password).toBeUndefined();
    });

    it('should return 409 Conflict when registering with duplicate email', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send(testUser);

      expect(response.status).toBe(409);
    });
  });

  describe('POST /auth/login (Public)', () => {
    it('should return 401 when password is incorrect', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: testUser.email,
          password: 'wrongpassword',
        });

      expect(response.status).toBe(401);
    });

    it('should return 200 and access_token when credentials are correct', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password,
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('access_token');
      expect(response.body).toHaveProperty('token_type', 'Bearer');
      expect(response.body.user.email).toBe(testUser.email);

      token = response.body.access_token;
    });
  });

  describe('GET /auth/profile & GET /auth/me (Auth)', () => {
    it('should return 401 when no token is provided', async () => {
      const response = await request(app.getHttpServer()).get('/auth/profile');
      expect(response.status).toBe(401);
    });

    it('should return 401 when an invalid token is provided', async () => {
      const response = await request(app.getHttpServer())
        .get('/auth/profile')
        .set('Authorization', 'Bearer invalid-token');
      expect(response.status).toBe(401);
    });

    it('should return 200 and user profile when valid token is provided', async () => {
      const response = await request(app.getHttpServer())
        .get('/auth/profile')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.email).toBe(testUser.email);
      expect(response.body.name).toBe(testUser.name);
      expect(response.body.password).toBeUndefined();
    });

    it('should also work on /auth/me alias', async () => {
      const response = await request(app.getHttpServer())
        .get('/auth/me')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.email).toBe(testUser.email);
    });
  });

  describe('POST /auth/logout (Auth)', () => {
    it('should return 401 when trying to logout without token', async () => {
      const response = await request(app.getHttpServer()).post('/auth/logout');
      expect(response.status).toBe(401);
    });

    it('should logout successfully with valid token', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/logout')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Đăng xuất thành công');
    });

    it('should reject access to protected route after logout (token blacklisted)', async () => {
      const response = await request(app.getHttpServer())
        .get('/auth/profile')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(401);
    });
  });
});
