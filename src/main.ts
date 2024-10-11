import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConstantsService } from './services/constants.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());

  const constantService = app.get(ConstantsService);

  const config = new DocumentBuilder()
    .setTitle('Pinger Service')
    .setDescription('API for checking the health of services')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
      'JWT-auth',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  await app.listen(constantService.port, () => {
    Logger.log(
      `
        #################################################
        🛡  ${constantService.appName} API is running! Access URLs:
        🏠 HomePage:      ${constantService.appUrl}
        📄 Swagger Docs: ${constantService.appUrl}/docs/
        #################################################
        `,
    );
  });
}
bootstrap();
