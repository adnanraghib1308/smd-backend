import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ResponseInterceptor } from './interceptor/response.interceptor';
import { AllExceptionsFilter } from './filter/all-exception.filter';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const globalPrefix = process.env.GLOBAL_PREFIX || 'api/v1';
  app.enableCors({
    origin: [
      'http://localhost:5173',
      'http://localhost:5174',
      'http://192.168.18.82:5173',
      'http://192.168.18.82:5174',
      'http://192.168.18.82',
    ],
    credentials: true, // Allow cookies
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
  });
  app.setGlobalPrefix(globalPrefix);
  app.use(cookieParser());

  app.useGlobalInterceptors(new ResponseInterceptor());
  app.useGlobalFilters(new AllExceptionsFilter());

  await app.listen(process.env.PORT ?? 4000, '0.0.0.0');
}
bootstrap();
