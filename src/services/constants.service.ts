import { ConfigService } from '@nestjs/config';
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class ConstantsService {
  private readonly logger = new Logger(ConstantsService.name);

  constructor(private readonly config: ConfigService) {}

  get appName(): string {
    return this.config.get<string>('APP_NAME', 'DefaultApp');
  }

  get appUrl(): string {
    const nodeEnv = this.config.get<string>('NODE_ENV');
    return nodeEnv === 'production'
      ? this.config.get<string>('APP_PROD_URL')
      : this.config.get<string>('APP_DEV_URL');
  }

  get port(): number {
    return this.config.get<number>('PORT');
  }

  get regAppsCount(): number {
    return this.config.get<number>('APP_COUNT');
  }
  get isProduction(): boolean {
    return this.config.get<string>('NODE_ENV') === 'production';
  }

  //!FROM HERE
  get mailService(): string {
    return this.config.get<string>('MAIL_SERVICE');
  }

  get nodemailerEmail(): string {
    return this.config.get<string>('NODEMAILER_EMAIL');
  }

  get nodemailerPassword(): string {
    return this.config.get<string>('NODEMAILER_PASSWORD');
  }

  get mailerHost(): string {
    return this.config.get<string>('MAILER_HOST');
  }

  get mailerPort(): number {
    return this.config.get<number>('MAILER_PORT');
  }
}
