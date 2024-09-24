import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';
import { ConstantsService } from './services/constants.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const constantService = app.get(ConstantsService);

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
