import type { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { apiReference } from '@scalar/nestjs-api-reference';

export function setupScalar(app: INestApplication) {
  const swaggerConfig = new DocumentBuilder()
    .setTitle('My First API')
    .setDescription(
      'Tài liệu API tương tác với giao diện Scalar (tương tự Scalar trong .NET ASP). Hỗ trợ kiểm thử trực tiếp các endpoint đăng ký, đăng nhập và xác thực JWT Bearer token.',
    )
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Nhập JWT Access Token để xác thực',
      },
      'bearer',
    )
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);

  // Endpoint cung cấp file JSON OpenAPI Spec
  app.getHttpAdapter().get('/openapi.json', (_req, res) => {
    res.json(document);
  });

  // Giao diện Scalar API Reference (tương tự Scalar trong .NET ASP)
  const scalarMiddleware = apiReference({
    spec: {
      content: document,
    },
    pageTitle: 'My First API - Scalar API Reference',
    theme: 'purple',
    darkMode: true,
  });

  app.use('/scalar', scalarMiddleware);
  app.use('/reference', scalarMiddleware);

  return document;
}
