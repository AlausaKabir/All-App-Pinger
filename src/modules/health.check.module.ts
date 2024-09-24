import { ConstantsService } from './../services/constants.service';
import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HealthCheckService } from 'src/services/health-check.service';
import { MailerService } from 'src/services/mailer.service';

@Module({
  imports: [HttpModule],
  providers: [
    HealthCheckService,
    MailerService,
    ConstantsService,
    ConfigService,
  ],
  exports: [HealthCheckService],
})
export class HealthCheckModule {}
