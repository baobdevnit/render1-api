import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule, ObserveInstrument } from './app.module.js';
import { setupScalar } from './scalar.setup.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    instrument: ObserveInstrument,
  });

  // Cho phép CORS để Frontend (SPA/SSR) có thể kết nối thuận tiện
  app.enableCors({
    origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : true,
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type, Accept, Authorization',
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Cấu hình tài liệu API Scalar (tương tự Scalar trong .NET ASP)
  setupScalar(app);

  const port = process.env.PORT ?? 3000;
  await app.listen(port, '0.0.0.0');
  console.log(`🚀 Server đang chạy tại: http://localhost:${port}`);
  console.log(
    `📖 Scalar API Docs tại: http://localhost:${port}/scalar hoặc http://localhost:${port}/reference`,
  );
  console.log(
    `📄 OpenAPI Spec JSON tại: http://localhost:${port}/openapi.json`,
  );
}
await bootstrap();
