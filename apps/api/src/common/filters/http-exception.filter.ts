import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { Response } from 'express';
import { I18nContext, I18nService } from 'nestjs-i18n';

@Catch()
@Injectable()
export class HttpExceptionFilter implements ExceptionFilter {
  constructor(private readonly i18n?: I18nService) {}

  async catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const i18nContext = I18nContext.current(host);
    const lang = i18nContext?.lang || 'en';

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string | object = 'Internal server error';
    let errorName = 'Internal Server Error';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse();

      if (typeof res === 'object' && res !== null) {
        const rawMessage = (res as Record<string, unknown>).message || res;
        errorName = ((res as Record<string, unknown>).error as string) || exception.name;

        if (typeof rawMessage === 'string' && this.i18n) {
          try {
            message = this.i18n.t(`errors.${rawMessage}`, { lang, defaultValue: rawMessage });
          } catch {
            message = rawMessage;
          }
        } else {
          message = rawMessage;
        }
      } else if (typeof res === 'string') {
        if (this.i18n) {
          try {
            message = this.i18n.t(`errors.${res}`, { lang, defaultValue: res });
          } catch {
            message = res;
          }
        } else {
          message = res;
        }
        errorName = exception.name;
      }
    } else if (exception instanceof Error) {
      message = exception.message;
    }

    response.status(status).json({
      success: false,
      statusCode: status,
      message,
      error: errorName,
      timestamp: new Date().toISOString(),
    });
  }
}
