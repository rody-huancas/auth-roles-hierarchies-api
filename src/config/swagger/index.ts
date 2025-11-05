import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export function setupSwagger(app: INestApplication) {
  const enabled = process.env.SWAGGER_ENABLED === 'true';
  if (!enabled) return;

  const swaggerPath = process.env.SWAGGER_PATH || 'docs';
  const apiVersion  = process.env.API_VERSION  || '1.0';

  const config = new DocumentBuilder()
    .setTitle('Auth Roles Hierarchies API')
    .setDescription(
      'API REST para gestión de autenticación y autorización mediante roles jerárquicos. ' +
      'Desarrollada con NestJS y PostgreSQL, incluye JWT para autenticación segura.'
    )
    .setVersion(apiVersion)
    .setContact(
      'API Support',
      'https://github.com/rody-huancas/auth-roles-hierarchies-api',
      'novtiq@gmail.com'
    )
    .setLicense('MIT', 'https://opensource.org/licenses/MIT')
    .addServer('http://localhost:3000', 'Desarrollo')
    .addBearerAuth(
      {
        type        : 'http',
        scheme      : 'bearer',
        bearerFormat: 'JWT',
        name        : 'Authorization',
        description : 'Ingresa el token JWT',
        in          : 'header',
      },
      'JWT',
    )
    .addTag('Auth', 'Endpoints de autenticación')
    .addTag('Users', 'Gestión de usuarios')
    .addTag('Roles', 'Gestión de roles y permisos')
    .addTag('Hierarchies', 'Gestión de jerarquías organizacionales')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  
  SwaggerModule.setup(swaggerPath, app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      docExpansion        : 'none',
      filter              : true,
      showRequestDuration : true,
      tryItOutEnabled     : true,
    },
    customSiteTitle: 'Auth Roles API Documentation',
    customfavIcon  : '/favicon.ico',
    customCss      : `
      .swagger-ui .topbar { display: none }
      .swagger-ui .info .title { color: #1976d2; }
    `,
  });

  console.log(`Swagger documentation available at: /${swaggerPath}`);
}
