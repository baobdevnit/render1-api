import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SupabaseService } from '../supabase/supabase.service.js';
import { HealthService } from './health.service.js';

describe('HealthService', () => {
  let service: HealthService;
  let mockSupabaseClient: any;
  let mockConfigService: any;

  beforeEach(async () => {
    mockSupabaseClient = {
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          limit: vi
            .fn()
            .mockResolvedValue({ data: [{ id: '1' }], error: null }),
        }),
      }),
    };

    mockConfigService = {
      get: vi.fn((key: string) => {
        if (key === 'SUPABASE_URL') return 'https://demo.supabase.co';
        if (key === 'RENDER_GIT_COMMIT') return 'test-commit-sha';
        return null;
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HealthService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
        {
          provide: SupabaseService,
          useValue: {
            getClient: vi.fn().mockReturnValue(mockSupabaseClient),
          },
        },
      ],
    }).compile();

    service = module.get<HealthService>(HealthService);
  });

  it('khởi tạo thành công HealthService', () => {
    expect(service).toBeDefined();
  });

  describe('calculateOverallStatus', () => {
    it('trả về "pass" nếu tất cả các checks đều "pass"', () => {
      const checks = {
        uptime: [{ status: 'pass' as const }],
        memory: [{ status: 'pass' as const }],
      };
      expect(service.calculateOverallStatus(checks)).toBe('pass');
    });

    it('trả về "warn" nếu có check mang trạng thái "warn" và không có "fail"', () => {
      const checks = {
        uptime: [{ status: 'pass' as const }],
        memory: [{ status: 'warn' as const }],
      };
      expect(service.calculateOverallStatus(checks)).toBe('warn');
    });

    it('trả về "fail" nếu có ít nhất 1 check mang trạng thái "fail"', () => {
      const checks = {
        uptime: [{ status: 'pass' as const }],
        memory: [{ status: 'warn' as const }],
        database: [{ status: 'fail' as const }],
      };
      expect(service.calculateOverallStatus(checks)).toBe('fail');
    });
  });

  describe('checkSystemUptime', () => {
    it('trả về đối tượng check hợp lệ theo chuẩn IETF', () => {
      const result = service.checkSystemUptime();
      expect(result.componentType).toBe('system');
      expect(result.status).toBe('pass');
      expect(result.observedUnit).toBe('s');
      expect(typeof result.observedValue).toBe('number');
      expect(result.time).toBeDefined();
    });
  });

  describe('checkSystemMemory', () => {
    it('trả về dung lượng bộ nhớ Node.js heap với đơn vị MB', () => {
      const result = service.checkSystemMemory();
      expect(result.componentType).toBe('system');
      expect(['pass', 'warn']).toContain(result.status);
      expect(result.observedUnit).toBe('MB');
      expect(typeof result.observedValue).toBe('number');
      expect(result.time).toBeDefined();
    });
  });

  describe('checkSupabase', () => {
    it('trả về "pass" khi Supabase query thành công', async () => {
      const result = await service.checkSupabase();
      expect(result.componentId).toBe('supabase-database');
      expect(result.componentType).toBe('datastore');
      expect(result.status).toBe('pass');
      expect(result.observedUnit).toBe('ms');
      expect(typeof result.observedValue).toBe('number');
    });

    it('trả về "fail" khi Supabase trả về lỗi', async () => {
      mockSupabaseClient.from.mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue({
            data: null,
            error: { message: 'Database connection refused' },
          }),
        }),
      });

      const result = await service.checkSupabase();
      expect(result.status).toBe('fail');
      expect(result.output).toBe('Database connection refused');
    });

    it('trả về "fail" khi kết nối ném ngoại lệ', async () => {
      mockSupabaseClient.from.mockImplementationOnce(() => {
        throw new Error('Network error');
      });

      const result = await service.checkSupabase();
      expect(result.status).toBe('fail');
      expect(result.output).toBe('Network error');
    });

    it('trả về "warn" khi SUPABASE_URL chưa được cấu hình hoặc là placeholder', async () => {
      mockConfigService.get.mockReturnValueOnce(
        'https://your-project-id.supabase.co',
      );

      const result = await service.checkSupabase();
      expect(result.status).toBe('warn');
      expect(result.output).toContain('chưa được cấu hình');
    });
  });

  describe('getFullHealth', () => {
    it('trả về toàn bộ payload theo chuẩn IETF Draft', async () => {
      const health = await service.getFullHealth();
      expect(health.status).toBe('pass');
      expect(health.version).toBe('1');
      expect(health.releaseId).toBe('test-commit-sha');
      expect(health.serviceId).toBe('my-first-api');
      expect(health.checks).toHaveProperty('system:uptime');
      expect(health.checks).toHaveProperty('system:memory');
      expect(health.checks).toHaveProperty('datastore:supabase');
      expect(health.links?.self).toBe('/health');
    });
  });

  describe('getLiveness', () => {
    it('trả về kết quả liveness mà không phụ thuộc vào database', () => {
      const liveness = service.getLiveness();
      expect(['pass', 'warn']).toContain(liveness.status);
      expect(liveness.checks).toHaveProperty('system:uptime');
      expect(liveness.checks).toHaveProperty('system:memory');
      expect(liveness.checks).not.toHaveProperty('datastore:supabase');
    });
  });

  describe('getReadiness', () => {
    it('trả về kết quả readiness có kiểm tra cơ sở dữ liệu', async () => {
      const readiness = await service.getReadiness();
      expect(readiness.status).toBe('pass');
      expect(readiness.checks).toHaveProperty('datastore:supabase');
    });
  });
});
