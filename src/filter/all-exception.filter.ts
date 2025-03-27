import { ExceptionFilter, Catch, ArgumentsHost, HttpException } from '@nestjs/common';

@Catch(HttpException)
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const status = exception.getStatus();
    const message = exception.getResponse() instanceof Object ? (exception.getResponse() as any).message : exception.message;

    response.status(status).json({
      success: false,
      data: null,
      error: {
        code: status,
        message: message || 'Internal Server Error',
      },
    });
  }
}