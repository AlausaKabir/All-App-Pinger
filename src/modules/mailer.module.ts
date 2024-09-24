import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ConstantsService } from 'src/services/constants.service';
import { MailerService } from 'src/services/mailer.service';

@Global()
@Module({
  providers: [MailerService, ConfigService, ConstantsService],
  exports: [MailerService],
})
export class MailerModule {}
