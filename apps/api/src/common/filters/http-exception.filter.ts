import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import { I18nContext, I18nService } from 'nestjs-i18n';

@Catch()
@Injectable()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  constructor(private readonly i18n?: I18nService) {}

  async catch(exception: unknown, host: ArgumentsHost) {
    if (host.getType() === 'ws') {
      return;
    }

    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const i18nContext = I18nContext.current(host);
    const lang = i18nContext?.lang || 'vi';

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string | string[] = 'Internal server error';
    let errorName = 'Internal Server Error';

    // 1. Xử lý các ngoại lệ chuẩn HttpException của NestJS
    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse();

      if (typeof res === 'object' && res !== null) {
        const rawMessage = (res as Record<string, unknown>).message || res;
        errorName = ((res as Record<string, unknown>).error as string) || exception.name;

        if (Array.isArray(rawMessage)) {
          message = rawMessage.map((msg) => this.translateKey(String(msg), lang));
        } else if (typeof rawMessage === 'string') {
          message = this.translateKey(rawMessage, lang);
        } else {
          message = String(rawMessage);
        }
      } else if (typeof res === 'string') {
        message = this.translateKey(res, lang);
        errorName = exception.name;
      }
    }
    // 2. Xử lý ngoại lệ Prisma Database Errors (không làm lộ query/column nội bộ ra ngoài)
    else if (this.isPrismaError(exception)) {
      const prismaCode = (exception as any)?.code;
      this.logger.error(`[PrismaError] Code: ${prismaCode} - ${(exception as Error).message}`, (exception as Error).stack);

      switch (prismaCode) {
        case 'P2002':
          status = HttpStatus.CONFLICT;
          errorName = 'Conflict';
          message = this.translateKey('RESOURCE_ALREADY_EXISTS', lang);
          break;
        case 'P2025':
          status = HttpStatus.NOT_FOUND;
          errorName = 'Not Found';
          message = this.translateKey('RESOURCE_NOT_FOUND', lang);
          break;
        case 'P2003':
          status = HttpStatus.BAD_REQUEST;
          errorName = 'Bad Request';
          message = this.translateKey('BAD_REQUEST', lang);
          break;
        default:
          status = HttpStatus.INTERNAL_SERVER_ERROR;
          errorName = 'Database Error';
          message = this.translateKey('DATABASE_ERROR', lang);
          break;
      }
    }
    // 3. Xử lý ngoại lệ runtime / hệ thống không xác định
    else if (exception instanceof Error) {
      this.logger.error(`[UnhandledError] ${exception.message}`, exception.stack);
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      errorName = 'Internal Server Error';
      message = this.translateKey('INTERNAL_SERVER_ERROR', lang);
    }

    response.status(status).json({
      success: false,
      statusCode: status,
      message,
      error: errorName,
      timestamp: new Date().toISOString(),
    });
  }

  private translateKey(key: string, lang: string): string {
    if (!this.i18n) return key;

    // Check if key exists in errors dictionary
    try {
      const translated = this.i18n.t(`errors.${key}`, { lang, defaultValue: key });
      return translated || key;
    } catch {
      return key;
    }
  }

  private isPrismaError(error: unknown): boolean {
    if (!error || typeof error !== 'object') return false;
    const name = (error as Error).name || '';
    const constructorName = error.constructor?.name || '';
    return (
      name.includes('Prisma') ||
      constructorName.includes('Prisma') ||
      Boolean((error as any).clientVersion) ||
      Boolean((error as any).code?.startsWith('P'))
    );
  }
}
