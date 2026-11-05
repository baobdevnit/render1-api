import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { getCorsOrigins, isOriginAllowed } from './cors.setup.js';

describe('CORS Setup & Whitelist Verification', () => {
  const originalEnv = process.env.CORS_ORIGIN;

  beforeEach(() => {
    delete process.env.CORS_ORIGIN;
  });

  afterEach(() => {
    if (originalEnv !== undefined) {
      process.env.CORS_ORIGIN = originalEnv;
    } else {
      delete process.env.CORS_ORIGIN;
    }
  });

  describe('getCorsOrigins', () => {
    it('trả về danh sách mặc định khi không có biến môi trường CORS_ORIGIN', () => {
      const origins = getCorsOrigins();
      expect(origins).toContain('https://vercel1-react.vercel.app');
      expect(origins).toContain('http://localhost:5173');
      expect(origins).toContain('http://localhost:3000');
    });

    it('gộp thêm các origin từ biến môi trường CORS_ORIGIN với xử lý trim khoảng trắng', () => {
      process.env.CORS_ORIGIN = 'https://custom-app.com , http://localhost:8080 ';
      const origins = getCorsOrigins();
      expect(origins).toContain('https://custom-app.com');
      expect(origins).toContain('http://localhost:8080');
      expect(origins).toContain('https://vercel1-react.vercel.app');
    });
  });

  describe('isOriginAllowed', () => {
    it('cho phép request không có header origin (cURL, mobile app, APM health checks)', () => {
      expect(isOriginAllowed(undefined)).toBe(true);
      expect(isOriginAllowed('')).toBe(true);
    });

    it('cho phép production front-end URL trên Vercel', () => {
      expect(isOriginAllowed('https://vercel1-react.vercel.app')).toBe(true);
    });

    it('cho phép các preview deployments của front-end trên Vercel', () => {
      expect(
        isOriginAllowed('https://vercel1-react-git-feature-new.vercel.app'),
      ).toBe(true);
      expect(
        isOriginAllowed('https://vercel1-react-pr-123.vercel.app'),
      ).toBe(true);
    });

    it('cho phép local development trên localhost và 127.0.0.1 với mọi port', () => {
      expect(isOriginAllowed('http://localhost:5173')).toBe(true);
      expect(isOriginAllowed('http://localhost:3000')).toBe(true);
      expect(isOriginAllowed('http://localhost:4173')).toBe(true);
      expect(isOriginAllowed('http://127.0.0.1:5173')).toBe(true);
    });

    it('từ chối origin lạ không nằm trong danh sách được cấp phép', () => {
      expect(isOriginAllowed('https://malicious-site.com')).toBe(false);
      expect(isOriginAllowed('https://evil-hacker.net')).toBe(false);
      expect(isOriginAllowed('https://other-vercel-app.vercel.app')).toBe(false);
    });

    it('cho phép mọi origin nếu cấu hình CORS_ORIGIN=*', () => {
      process.env.CORS_ORIGIN = '*';
      expect(isOriginAllowed('https://any-domain.com')).toBe(true);
    });
  });
});
