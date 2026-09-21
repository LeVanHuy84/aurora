import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ArgumentsHost, BadRequestException, HttpStatus } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import { HttpExceptionFilter } from './http-exception.filter.js';

describe('HttpExceptionFilter', () => {
  let filter: HttpExceptionFilter;
  let mockI18nService: Partial<I18nService>;

  const mockJson = vi.fn();
  const mockStatus = vi.fn().mockImplementation(() => ({ json: mockJson }));
  const mockGetResponse = vi.fn().mockReturnValue({ status: mockStatus });
  const mockHttpArgumentsHost = {
    getResponse: mockGetResponse,
    getRequest: vi.fn().mockReturnValue({ headers: {} }),
    getNext: vi.fn(),
  };

  const mockArgumentsHost: ArgumentsHost = {
    switchToHttp: () => mockHttpArgumentsHost as any,
    getArgByIndex: vi.fn(),
    getArgs: vi.fn(),
    getType: vi.fn(),
    switchToRpc: vi.fn(),
    switchToWs: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockI18nService = {
      t: vi.fn().mockImplementation((key: string) => `translated_${key}`),
    };
    filter = new HttpExceptionFilter(mockI18nService as I18nService);
  });

  it('should be defined', () => {
    expect(filter).toBeDefined();
  });

  it('should catch HttpException and format response with translation', async () => {
    const exception = new BadRequestException('INVALID_CREDENTIALS');

    await filter.catch(exception, mockArgumentsHost);

    expect(mockStatus).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    expect(mockJson).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'translated_errors.INVALID_CREDENTIALS',
        error: 'Bad Request',
      }),
    );
  });

  it('should catch generic Error and return 500 status with localized message', async () => {
    const exception = new Error('Unexpected crash');

    await filter.catch(exception, mockArgumentsHost);

    expect(mockStatus).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
    expect(mockJson).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'translated_errors.INTERNAL_SERVER_ERROR',
        error: 'Internal Server Error',
      }),
    );
  });

  it('should catch Prisma known error (P2002) and return 409 Conflict', async () => {
    const prismaError = new Error('Unique constraint failed') as any;
    prismaError.name = 'PrismaClientKnownRequestError';
    prismaError.code = 'P2002';

    await filter.catch(prismaError, mockArgumentsHost);

    expect(mockStatus).toHaveBeenCalledWith(HttpStatus.CONFLICT);
    expect(mockJson).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        statusCode: HttpStatus.CONFLICT,
        message: 'translated_errors.RESOURCE_ALREADY_EXISTS',
        error: 'Conflict',
      }),
    );
  });
});
