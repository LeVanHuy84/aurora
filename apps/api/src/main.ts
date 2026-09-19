import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS
  app.enableCors();

  // Global Prefix (exclude health check & root)
  app.setGlobalPrefix('api/v1', {
    exclude: ['/', 'health'],
  });

  // Global Validation Pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Swagger Documentation Setup
  const config = new DocumentBuilder()
    .setTitle('Aurora API')
    .setDescription('Backend REST API documentation for Aurora Private Social Diary')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT ?? 3000;
  await app.listen(port, '0.0.0.0');

  const baseUrl =
    process.env.BASE_URL ??
    process.env.RENDER_EXTERNAL_URL ??
    `http://localhost:${port}`;

  console.log(`🚀 Aurora API running on: ${baseUrl}/api/v1`);
  console.log(`📚 Swagger Docs available at: ${baseUrl}/api/docs`);
}
await bootstrap();
