import { HttpStatus } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { HealthResponseDto } from './dto/health-response.dto.js';
import { HealthController } from './health.controller.js';
import { HealthService } from './health.service.js';

describe('HealthController', () => {
  let controller: HealthController;
  let mockHealthService: any;
  let mockResponse: any;

  beforeEach(async () => {
    mockHealthService = {
      getFullHealth: vi.fn(),
      getLiveness: vi.fn(),
      getReadiness: vi.fn(),
    };

    mockResponse = {
      setHeader: vi.fn(),
      status: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [
        {
          provide: HealthService,
          useValue: mockHealthService,
        },
      ],
    }).compile();

    controller = module.get<HealthController>(HealthController);
  });

  it('khởi tạo thành công HealthController', () => {
    expect(controller).toBeDefined();
  });

  describe('checkHealth', () => {
    it('trả về HTTP 200 và header application/health+json khi trạng thái là "pass"', async () => {
      const mockResult: HealthResponseDto = {
        status: 'pass',
        version: '1',
        checks: {},
      };
      mockHealthService.getFullHealth.mockResolvedValue(mockResult);

      const response = await controller.checkHealth(mockResponse);

      expect(response).toEqual(mockResult);
      expect(mockResponse.setHeader).toHaveBeenCalledWith(
        'Content-Type',
        'application/health+json; charset=utf-8',
      );
      expect(mockResponse.setHeader).toHaveBeenCalledWith(
        'Cache-Control',
        'no-cache, no-store, must-revalidate',
      );
      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.OK);
    });

    it('trả về HTTP 503 khi trạng thái là "fail"', async () => {
      const mockResult: HealthResponseDto = {
        status: 'fail',
        version: '1',
        checks: {},
      };
      mockHealthService.getFullHealth.mockResolvedValue(mockResult);

      const response = await controller.checkHealth(mockResponse);

      expect(response).toEqual(mockResult);
      expect(mockResponse.status).toHaveBeenCalledWith(
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    });
  });

  describe('checkLiveness', () => {
    it('trả về kết quả liveness và gán header chuẩn IETF', () => {
      const mockResult: HealthResponseDto = {
        status: 'pass',
        version: '1',
      };
      mockHealthService.getLiveness.mockReturnValue(mockResult);

      const response = controller.checkLiveness(mockResponse);

      expect(response).toEqual(mockResult);
      expect(mockResponse.setHeader).toHaveBeenCalledWith(
        'Content-Type',
        'application/health+json; charset=utf-8',
      );
      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.OK);
    });
  });

  describe('checkReadiness', () => {
    it('trả về kết quả readiness và gán HTTP 200 nếu pass', async () => {
      const mockResult: HealthResponseDto = {
        status: 'pass',
        version: '1',
      };
      mockHealthService.getReadiness.mockResolvedValue(mockResult);

      const response = await controller.checkReadiness(mockResponse);

      expect(response).toEqual(mockResult);
      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.OK);
    });

    it('trả về HTTP 503 nếu readiness fail', async () => {
      const mockResult: HealthResponseDto = {
        status: 'fail',
        version: '1',
      };
      mockHealthService.getReadiness.mockResolvedValue(mockResult);

      const response = await controller.checkReadiness(mockResponse);

      expect(response).toEqual(mockResult);
      expect(mockResponse.status).toHaveBeenCalledWith(
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    });
  });
});
