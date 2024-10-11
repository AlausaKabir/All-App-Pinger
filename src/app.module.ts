import { AuthController } from './auth/auth.controller';
import { EmailController } from './controllers/email.controller';
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { ConstantsService } from './services/constants.service';
import { ServiceCheckModule } from './modules/service.check.module';
import { MailerModule } from './modules/mailer.module';
import { ScheduleModule } from '@nestjs/schedule';
import { ServiceCheckController } from './controllers/service-check.controller';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    ConfigModule.forRoot(),
    ServiceCheckModule,
    MailerModule,
    AuthModule,
  ],
  controllers: [
    AppController,
    AuthController,
    EmailController,
    ServiceCheckController,
  ],
  providers: [AppService, ConstantsService],
})
export class AppModule {}
