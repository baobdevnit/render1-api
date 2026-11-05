import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SupabaseService } from '../supabase/supabase.service.js';
import {
  HealthCheckItemDto,
  HealthResponseDto,
  HealthStatus,
} from './dto/health-response.dto.js';

@Injectable()
export class HealthService {
  private readonly logger = new Logger(HealthService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly supabaseService: SupabaseService,
  ) {}

  /**
   * Tính toán trạng thái tổng thể dựa trên kết quả các checks theo chuẩn IETF:
   * - Nếu bất kỳ check nào là "fail" => tổng thể là "fail"
   * - Nếu có check "warn" và không có "fail" => tổng thể là "warn"
   * - Tất cả đều "pass" => tổng thể là "pass"
   */
  calculateOverallStatus(
    checks: Record<string, HealthCheckItemDto[]>,
  ): HealthStatus {
    let hasWarn = false;
    for (const checkList of Object.values(checks)) {
      for (const item of checkList) {
        if (item.status === 'fail') {
          return 'fail';
        }
        if (item.status === 'warn') {
          hasWarn = true;
        }
      }
    }
    return hasWarn ? 'warn' : 'pass';
  }

  /**
   * Kiểm tra thời gian máy chủ đã hoạt động (Uptime)
   */
  checkSystemUptime(): HealthCheckItemDto {
    const uptimeSeconds = Math.round(process.uptime());
    return {
      componentId: 'node-process',
      componentType: 'system',
      status: 'pass',
      observedValue: uptimeSeconds,
      observedUnit: 's',
      time: new Date().toISOString(),
      output: `Tiến trình hoạt động ổn định trong ${uptimeSeconds} giây`,
    };
  }

  /**
   * Kiểm tra lượng RAM đang sử dụng của tiến trình Node.js
   */
  checkSystemMemory(): HealthCheckItemDto {
    const mem = process.memoryUsage();
    const heapUsedMb = Math.round((mem.heapUsed / 1024 / 1024) * 100) / 100;
    const heapTotalMb = Math.round((mem.heapTotal / 1024 / 1024) * 100) / 100;
    const ratio = mem.heapTotal > 0 ? mem.heapUsed / mem.heapTotal : 0;
    const isHighMemory = ratio > 0.95;

    return {
      componentId: 'node-heap',
      componentType: 'system',
      status: isHighMemory ? 'warn' : 'pass',
      observedValue: heapUsedMb,
      observedUnit: 'MB',
      time: new Date().toISOString(),
      output: isHighMemory
        ? `Cảnh báo bộ nhớ heap cao: ${heapUsedMb}MB / ${heapTotalMb}MB (${Math.round(ratio * 100)}%)`
        : `Bộ nhớ sử dụng bình thường: ${heapUsedMb}MB / ${heapTotalMb}MB`,
    };
  }

  /**
   * Kiểm tra kết nối tới cơ sở dữ liệu Supabase kèm giới hạn timeout (3000ms)
   */
  async checkSupabase(): Promise<HealthCheckItemDto> {
    const time = new Date().toISOString();
    const supabaseUrl = this.configService.get<string>('SUPABASE_URL');

    // Kiểm tra cấu hình nếu chưa có URL hoặc vẫn dùng URL mẫu
    if (
      !supabaseUrl ||
      supabaseUrl.includes('your-project-id') ||
      supabaseUrl.includes('placeholder')
    ) {
      return {
        componentId: 'supabase-database',
        componentType: 'datastore',
        status: 'warn',
        time,
        output: 'SUPABASE_URL chưa được cấu hình hoặc đang dùng thông tin mẫu',
      };
    }

    const start = performance.now();
    try {
      const client = this.supabaseService.getClient();

      // Giới hạn timeout 3 giây tránh treo health check khi network chậm
      const timeoutPromise = new Promise<{
        data: null;
        error: { message: string };
      }>((resolve) =>
        setTimeout(
          () =>
            resolve({
              data: null,
              error: { message: 'Supabase ping timed out (3000ms)' },
            }),
          3000,
        ),
      );

      // Thử truy vấn 1 bản ghi từ bảng users
      const queryPromise = client.from('users').select('id').limit(1);

      const result = (await Promise.race([queryPromise, timeoutPromise])) as {
        data: unknown;
        error: { message: string } | null;
      };

      const latencyMs = Math.round(performance.now() - start);

      if (result.error) {
        this.logger.warn(
          `Lỗi phản hồi khi kiểm tra Supabase: ${result.error.message}`,
        );
        return {
          componentId: 'supabase-database',
          componentType: 'datastore',
          status: 'fail',
          time,
          observedValue: latencyMs,
          observedUnit: 'ms',
          output: result.error.message,
        };
      }

      return {
        componentId: 'supabase-database',
        componentType: 'datastore',
        status: 'pass',
        time,
        observedValue: latencyMs,
        observedUnit: 'ms',
        output: `Kết nối Supabase phản hồi trong ${latencyMs}ms`,
      };
    } catch (err: unknown) {
      const latencyMs = Math.round(performance.now() - start);
      const errorMessage = err instanceof Error ? err.message : String(err);
      this.logger.error(`Ngoại lệ khi kiểm tra Supabase: ${errorMessage}`);
      return {
        componentId: 'supabase-database',
        componentType: 'datastore',
        status: 'fail',
        time,
        observedValue: latencyMs,
        observedUnit: 'ms',
        output: errorMessage,
      };
    }
  }

  /**
   * Health check toàn diện (System + Datastore/Dependencies)
   */
  async getFullHealth(): Promise<HealthResponseDto> {
    const uptimeCheck = this.checkSystemUptime();
    const memoryCheck = this.checkSystemMemory();
    const supabaseCheck = await this.checkSupabase();

    const checks: Record<string, HealthCheckItemDto[]> = {
      'system:uptime': [uptimeCheck],
      'system:memory': [memoryCheck],
      'datastore:supabase': [supabaseCheck],
    };

    const status = this.calculateOverallStatus(checks);
    const releaseId =
      this.configService.get<string>('RENDER_GIT_COMMIT') ||
      process.env.RENDER_GIT_COMMIT ||
      process.env.npm_package_version ||
      '0.0.1';

    const notes: string[] = [];
    if (status === 'pass') {
      notes.push(
        'Tất cả hệ thống và dịch vụ phụ thuộc đều hoạt động bình thường.',
      );
    } else if (status === 'warn') {
      notes.push(
        'Một số thành phần hệ thống có cảnh báo nhưng vẫn đang phục vụ yêu cầu.',
      );
    } else {
      notes.push(
        'Dịch vụ phụ thuộc gặp sự cố hoặc kết nối cơ sở dữ liệu thất bại.',
      );
    }

    return {
      status,
      version: '1',
      releaseId,
      notes,
      serviceId: 'my-first-api',
      description:
        'Health status for my-first-api conforming to IETF Draft specification',
      checks,
      links: {
        self: '/health',
        docs: '/scalar',
      },
    };
  }

  /**
   * Liveness Probe: chỉ kiểm tra tài nguyên cục bộ nội tại của process (Uptime, Memory)
   * Nhanh, nhẹ, không gọi mạng bên ngoài, dùng cho orchestrator liveness check.
   */
  getLiveness(): HealthResponseDto {
    const uptimeCheck = this.checkSystemUptime();
    const memoryCheck = this.checkSystemMemory();

    const checks: Record<string, HealthCheckItemDto[]> = {
      'system:uptime': [uptimeCheck],
      'system:memory': [memoryCheck],
    };

    const status = this.calculateOverallStatus(checks);

    return {
      status,
      version: '1',
      releaseId: process.env.npm_package_version || '0.0.1',
      serviceId: 'my-first-api',
      description: 'Liveness probe for process availability',
      checks,
      links: {
        self: '/health/live',
      },
    };
  }

  /**
   * Readiness Probe: kiểm tra các phụ thuộc sống còn (Supabase DB) trước khi nhận traffic.
   */
  async getReadiness(): Promise<HealthResponseDto> {
    const supabaseCheck = await this.checkSupabase();

    const checks: Record<string, HealthCheckItemDto[]> = {
      'datastore:supabase': [supabaseCheck],
    };

    const status = this.calculateOverallStatus(checks);

    return {
      status,
      version: '1',
      releaseId: process.env.npm_package_version || '0.0.1',
      serviceId: 'my-first-api',
      description: 'Readiness probe for dependency availability',
      checks,
      links: {
        self: '/health/ready',
      },
    };
  }
}
