import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, OpenAPIObject, SwaggerModule } from '@nestjs/swagger';

export function setupSwagger(app: INestApplication) {
  const enabled = process.env.SWAGGER_ENABLED === 'true';
  if (!enabled) return;

  const swaggerPath = process.env.SWAGGER_PATH || 'docs';

  const config = new DocumentBuilder()
    .setTitle('Auth Roles Hierarchies API')
    .setDescription(
      'Autenticación y roles por jerarquías usando NestJS y PostgreSQL',
    )
    .setVersion('1.0')
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      'JWT',
    )
    .build();

  SwaggerModule.setup(swaggerPath, app, config as OpenAPIObject, {
    swaggerOptions: {
      persistAuthorization: true,
    },
    customSiteTitle: 'Auth Roles API Docs',
  });
}
