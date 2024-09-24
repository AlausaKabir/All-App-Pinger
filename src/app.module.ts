import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { ConstantsService } from './services/constants.service';
import { HealthCheckModule } from './modules/health.check.module';
import { MailerModule } from './modules/mailer.module';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    ConfigModule.forRoot(),
    HealthCheckModule,
    MailerModule,
  ],
  controllers: [AppController],
  providers: [AppService, ConstantsService],
})
export class AppModule {}
