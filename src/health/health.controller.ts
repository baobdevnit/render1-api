import { Controller, Get, HttpStatus, Res } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import { HealthResponseDto } from './dto/health-response.dto.js';
import { HealthService } from './health.service.js';

const HEALTH_JSON_MEDIA_TYPE = 'application/health+json';

@ApiTags('Health Check')
@Controller()
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get(['health', 'healthz'])
  @ApiOperation({
    summary: 'Kiểm tra sức khỏe hệ thống theo chuẩn IETF Draft',
    description:
      'Trả về dữ liệu định dạng JSON theo tiêu chuẩn RFC Draft "Health Check Response Format for HTTP APIs" (Content-Type: application/health+json). Thích hợp cho Render Periodic Health Check, Kubernetes probes, UptimeRobot, Pingdom, Better Uptime và các hệ thống APM.',
  })
  @ApiResponse({
    status: 200,
    description:
      'Hệ thống hoạt động bình thường ("pass") hoặc có cảnh báo nhẹ không ảnh hưởng nghiêm trọng ("warn").',
    type: HealthResponseDto,
  })
  @ApiResponse({
    status: 503,
    description:
      'Hệ thống hoặc dịch vụ phụ thuộc sống còn (Database) gặp sự cố ("fail").',
    type: HealthResponseDto,
  })
  async checkHealth(
    @Res({ passthrough: true }) res: Response,
  ): Promise<HealthResponseDto> {
    const result = await this.healthService.getFullHealth();
    this.applyHealthHeaders(res, result.status);
    return result;
  }

  @Get('health/live')
  @ApiOperation({
    summary: 'Liveness Probe (Tiến trình đang chạy)',
    description:
      'Kiểm tra nhẹ các chỉ số hệ thống nội tại (Uptime, Memory) của tiến trình Node.js mà không gọi dịch vụ bên ngoài.',
  })
  @ApiResponse({
    status: 200,
    description: 'Tiến trình dịch vụ đang chạy ổn định.',
    type: HealthResponseDto,
  })
  checkLiveness(@Res({ passthrough: true }) res: Response): HealthResponseDto {
    const result = this.healthService.getLiveness();
    this.applyHealthHeaders(res, result.status);
    return result;
  }

  @Get('health/ready')
  @ApiOperation({
    summary: 'Readiness Probe (Sẵn sàng phục vụ yêu cầu)',
    description:
      'Kiểm tra khả năng kết nối tới các dịch vụ phụ thuộc (Supabase Database) để đảm bảo API sẵn sàng nhận traffic.',
  })
  @ApiResponse({
    status: 200,
    description: 'Cơ sở dữ liệu sẵn sàng tiếp nhận truy vấn.',
    type: HealthResponseDto,
  })
  @ApiResponse({
    status: 503,
    description: 'Cơ sở dữ liệu hoặc phụ thuộc chưa sẵn sàng.',
    type: HealthResponseDto,
  })
  async checkReadiness(
    @Res({ passthrough: true }) res: Response,
  ): Promise<HealthResponseDto> {
    const result = await this.healthService.getReadiness();
    this.applyHealthHeaders(res, result.status);
    return result;
  }

  /**
   * Thiết lập HTTP headers theo chuẩn IETF Draft:
   * - Content-Type: application/health+json; charset=utf-8
   * - Cache-Control: no-cache, no-store, must-revalidate (tránh cache kết quả kiểm tra sức khỏe)
   * - HTTP Status: 200 nếu pass/warn, 503 nếu fail
   */
  private applyHealthHeaders(res: Response, status: string): void {
    res.setHeader('Content-Type', `${HEALTH_JSON_MEDIA_TYPE}; charset=utf-8`);
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');

    if (status === 'fail') {
      res.status(HttpStatus.SERVICE_UNAVAILABLE);
    } else {
      res.status(HttpStatus.OK);
    }
  }
}
