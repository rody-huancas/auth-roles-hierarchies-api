import { NestFactory } from '@nestjs/core';
import { useContainer } from 'class-validator';
import { Logger, ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const PORT   = 3000;
  const logger = new Logger('Main');
  const app    = await NestFactory.create(AppModule);

  useContainer(app.select(AppModule), { fallbackOnErrors: true });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist           : true,
      forbidNonWhitelisted: true,
      transform           : true,
      transformOptions    : {
        enableImplicitConversion: true
      },
    }),
  );

  await app.listen(PORT, () => {
    logger.log(`[INFO] Server is running on localhost:${PORT}`);
  });
}
bootstrap();
