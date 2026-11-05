import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule, ObserveInstrument } from './app.module.js';
import { setupCors } from './cors.setup.js';
import { setupScalar } from './scalar.setup.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    instrument: ObserveInstrument,
  });

  // Cấu hình CORS tối ưu cho Frontend đã triển khai trên Vercel và môi trường phát triển cục bộ
  setupCors(app);

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
