import { EmailController } from './controllers/email.controller';
import { ServiceRepository } from './repositories/service-check.repository';
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { ConstantsService } from './services/constants.service';
import { ServiceCheckModule } from './modules/service.check.module';
import { MailerModule } from './modules/mailer.module';
import { ScheduleModule } from '@nestjs/schedule';
import { ServiceCheckController } from './controllers/service-check.controller';
import { ServiceCheckService } from './services/serviceCheck.service';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    ConfigModule.forRoot(),
    ServiceCheckModule,
    MailerModule,
  ],
  controllers: [AppController, EmailController, ServiceCheckController],
  providers: [AppService, ConstantsService],
})
export class AppModule {}
