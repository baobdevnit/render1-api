import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types.js';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { AppModule } from '../src/app.module.js';
import { setupScalar } from '../src/scalar.setup.js';

describe('AppController & Scalar Docs (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    setupScalar(app);
    await app.init();
  });

  it('/ (GET) should return Hello World!', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Hello World!');
  });

  it('/openapi.json (GET) should return OpenAPI 3.0 specification json', async () => {
    const response = await request(app.getHttpServer())
      .get('/openapi.json')
      .expect(200);

    expect(response.headers['content-type']).toContain('application/json');
    expect(response.body).toHaveProperty('openapi');
    expect(response.body.info.title).toBe('My First API');
    expect(response.body.paths).toHaveProperty('/auth/login');
    expect(response.body.paths).toHaveProperty('/auth/register');
  });

  it('/scalar (GET) should return Scalar API Reference HTML page', async () => {
    const response = await request(app.getHttpServer())
      .get('/scalar')
      .expect(200);

    expect(response.headers['content-type']).toContain('text/html');
    expect(response.text).toContain('Scalar API Reference');
  });

  it('/reference (GET) should also serve Scalar API Reference HTML page', async () => {
    const response = await request(app.getHttpServer())
      .get('/reference')
      .expect(200);

    expect(response.headers['content-type']).toContain('text/html');
    expect(response.text).toContain('Scalar API Reference');
  });

  afterEach(async () => {
    await app.close();
  });
});
