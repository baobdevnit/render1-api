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

  it('/health (GET) should return IETF Draft health json format', async () => {
    const response = await request(app.getHttpServer()).get('/health');

    // HTTP 200 (pass/warn) or 503 (fail depending on network/Supabase)
    expect([200, 503]).toContain(response.status);
    expect(response.headers['content-type']).toContain(
      'application/health+json',
    );
    expect(response.headers['cache-control']).toBe(
      'no-cache, no-store, must-revalidate',
    );
    expect(['pass', 'warn', 'fail']).toContain(response.body.status);
    expect(response.body).toHaveProperty('version');
    expect(response.body).toHaveProperty('releaseId');
    expect(response.body).toHaveProperty('checks');
    expect(response.body.checks).toHaveProperty('system:uptime');
    expect(response.body.checks).toHaveProperty('system:memory');
  });

  it('/healthz (GET) should alias to /health', async () => {
    const response = await request(app.getHttpServer()).get('/healthz');
    expect([200, 503]).toContain(response.status);
    expect(response.headers['content-type']).toContain(
      'application/health+json',
    );
    expect(['pass', 'warn', 'fail']).toContain(response.body.status);
  });

  it('/health/live (GET) should return 200 for liveness probe', async () => {
    const response = await request(app.getHttpServer())
      .get('/health/live')
      .expect(200);

    expect(response.headers['content-type']).toContain(
      'application/health+json',
    );
    expect(['pass', 'warn']).toContain(response.body.status);
    expect(response.body.checks).toHaveProperty('system:uptime');
    expect(response.body.checks).toHaveProperty('system:memory');
  });

  afterEach(async () => {
    await app.close();
  });
});
