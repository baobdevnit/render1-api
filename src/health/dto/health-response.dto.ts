import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export type HealthStatus = 'pass' | 'fail' | 'warn';

export class HealthCheckItemDto {
  @ApiPropertyOptional({
    description:
      'Định danh duy nhất của thành phần (hữu ích khi có nhiều node/thành phần cùng loại)',
    example: 'supabase-database',
  })
  componentId?: string;

  @ApiPropertyOptional({
    description:
      'Phân loại loại thành phần (ví dụ: system, datastore, component)',
    example: 'datastore',
  })
  componentType?: 'system' | 'datastore' | 'component' | (string & {});

  @ApiProperty({
    description:
      'Trạng thái sức khỏe của thành phần con ("pass", "fail", "warn")',
    enum: ['pass', 'fail', 'warn'],
    example: 'pass',
  })
  status!: HealthStatus;

  @ApiPropertyOptional({
    description:
      'Giá trị đo lường quan sát được (ví dụ latency ms, bộ nhớ MB, uptime giây)',
    example: 45,
  })
  observedValue?: number | string | boolean | Record<string, unknown>;

  @ApiPropertyOptional({
    description:
      'Đơn vị đo lường của observedValue (ví dụ: ms, s, MB, percent)',
    example: 'ms',
  })
  observedUnit?: string;

  @ApiPropertyOptional({
    description: 'Thời điểm thực hiện kiểm tra theo chuẩn ISO 8601',
    example: '2026-11-05T05:44:00.000Z',
  })
  time?: string;

  @ApiPropertyOptional({
    description: 'Thông báo lỗi chi tiết hoặc chẩn đoán khi gặp sự cố/cảnh báo',
    example: 'Connection latency is within normal thresholds',
  })
  output?: string;

  @ApiPropertyOptional({
    description: 'Các liên kết liên quan đến thành phần (runbook, status page)',
    example: {
      about: 'https://status.supabase.com',
    },
  })
  links?: Record<string, string>;
}

export class HealthResponseDto {
  @ApiProperty({
    description:
      'Trạng thái tổng thể hệ thống theo chuẩn IETF: "pass" (khỏe mạnh), "fail" (sự cố nghiêm trọng), "warn" (suy giảm hiệu năng/cảnh báo nhẹ)',
    enum: ['pass', 'fail', 'warn'],
    example: 'pass',
  })
  status!: HealthStatus;

  @ApiPropertyOptional({
    description: 'Phiên bản dịch vụ công khai',
    example: '1',
  })
  version?: string;

  @ApiPropertyOptional({
    description:
      'Mã định danh bản phát hành / triển khai (Git commit SHA, release tag, build number)',
    example: '0.0.1',
  })
  releaseId?: string;

  @ApiPropertyOptional({
    description: 'Mảng ghi chú con người đọc được về trạng thái hiện tại',
    example: ['Hệ thống hoạt động bình thường'],
  })
  notes?: string[];

  @ApiPropertyOptional({
    description: 'Thông báo lỗi thô hoặc chẩn đoán cấp cao',
  })
  output?: string;

  @ApiPropertyOptional({
    description: 'Mã định danh duy nhất của service instance',
    example: 'my-first-api',
  })
  serviceId?: string;

  @ApiPropertyOptional({
    description: 'Mô tả ngắn gọn về dịch vụ',
    example: 'Health status for my-first-api',
  })
  description?: string;

  @ApiPropertyOptional({
    description:
      'Danh sách các kiểm tra chi tiết theo chuẩn IETF: key là tên thành phần/chỉ số, value là mảng các lần đo',
  })
  checks?: Record<string, HealthCheckItemDto[]>;

  @ApiPropertyOptional({
    description: 'Các liên kết điều hướng liên quan',
    example: {
      self: '/health',
      docs: '/scalar',
    },
  })
  links?: Record<string, string>;
}
