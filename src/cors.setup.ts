import type { INestApplication } from '@nestjs/common';

/**
 * Trả về danh sách origins mặc định và từ biến môi trường CORS_ORIGIN
 */
export function getCorsOrigins(): string[] {
  const envOrigins = process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(',')
        .map((origin) => origin.trim())
        .filter(Boolean)
    : [];

  const defaultOrigins = [
    'https://vercel1-react.vercel.app',
    'http://localhost:5173',
    'http://localhost:3000',
    'http://localhost:4173',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:3000',
  ];

  return Array.from(new Set([...defaultOrigins, ...envOrigins]));
}

/**
 * Kiểm tra xem một origin có được phép kết nối qua CORS hay không
 * @param origin Chuỗi origin từ header HTTP
 */
export function isOriginAllowed(origin: string | undefined): boolean {
  // Cho phép requests không có origin (ví dụ server-to-server, mobile app, cURL, health check probe)
  if (!origin) {
    return true;
  }

  const allowedOrigins = getCorsOrigins();

  // Cho phép wildcard nếu được cấu hình
  if (allowedOrigins.includes('*')) {
    return true;
  }

  // Khớp chính xác với danh sách origins đã cấu hình
  if (allowedOrigins.includes(origin)) {
    return true;
  }

  // Hỗ trợ production Vercel và các nhánh Preview Deployments (ví dụ https://vercel1-react-xxx.vercel.app)
  if (/^https:\/\/vercel1-react.*\.vercel\.app$/.test(origin)) {
    return true;
  }

  // Hỗ trợ local development trên bất kỳ port nào của localhost hoặc 127.0.0.1
  if (
    /^http:\/\/localhost(:\d+)?$/.test(origin) ||
    /^http:\/\/127\.0\.0\.1(:\d+)?$/.test(origin)
  ) {
    return true;
  }

  return false;
}

/**
 * Cấu hình CORS middleware cho NestJS Application
 */
export function setupCors(app: INestApplication) {
  app.enableCors({
    origin: (
      origin: string | undefined,
      callback: (err: Error | null, allow?: boolean) => void,
    ) => {
      if (isOriginAllowed(origin)) {
        callback(null, true);
      } else {
        callback(null, false);
      }
    },
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type, Accept, Authorization',
  });
}
