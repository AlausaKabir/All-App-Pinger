import { ConstantsService } from '../services/constants.service';
import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { EmailController } from 'src/controllers/email.controller';
import { ServiceCheckController } from 'src/controllers/service-check.controller';
import { CronJobs } from 'src/jobs/cron-job';
import { PrismaModule } from 'src/prisma/prisma.module';
import { EmailRepository } from 'src/repositories/email.respository';
import { ServiceRepository } from 'src/repositories/service-check.repository';
import { EmailService } from 'src/services/email.service';
import { MailerService } from 'src/services/mailer.service';
// import { MongoConnectionService } from 'src/services/mongoConnection.service';
import { ServiceCheckService } from 'src/services/serviceCheck.service';

@Module({
  imports: [
    HttpModule,
    PrismaModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: process.env.JWT_EXPIRES },
    }),
  ],
  controllers: [EmailController, ServiceCheckController],
  providers: [
    EmailRepository,
    ServiceRepository,
    ConfigService,
    ConstantsService,
    CronJobs,
    EmailService,
    MailerService,
    ServiceCheckService,
    // MongoConnectionService,
  ],
  exports: [ServiceCheckService, EmailService],
})
export class ServiceCheckModule {}
