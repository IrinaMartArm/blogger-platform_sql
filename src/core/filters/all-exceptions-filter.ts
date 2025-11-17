import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ErrorResponseBodyType } from './errorResponseBodyType';

@Catch()
export class AllHttpExceptionsFilter implements ExceptionFilter {
  catch(exception: Error, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let message = 'Unknown exception occurred.';
    let status = HttpStatus.INTERNAL_SERVER_ERROR;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse();
      message =
        typeof res === 'string'
          ? res
          : (res as any).message || exception.message;
    } else if (exception instanceof Error) {
      message = exception.message;
    }

    const responseBody = this.buildResponseBody(
      request.url,
      message,
      exception,
    );

    response.status(status).json(responseBody);
  }

  private buildResponseBody(
    requestUrl: string,
    message: string,
    exception: Error,
  ): ErrorResponseBodyType {
    //TODO: Replace with getter from configService. will be in the following lessons
    const isProduction = process.env.NODE_ENV === 'production';

    if (isProduction) {
      return { errorsMessages: [] };
    }

    return {
      errorsMessages: [
        { message: exception.message, field: exception.stack || '' },
      ],
    };
  }
}
