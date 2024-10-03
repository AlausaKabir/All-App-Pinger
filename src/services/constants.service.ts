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

  get regApps(): number {
    return this.config.get<number>('APP_COUNT');
  }
  get isProduction(): boolean {
    return this.config.get<string>('NODE_ENV') === 'production';
  }

  get monitoredApps(): { name: string; url: string; email: string }[] {
    this.logger.log(`Checking for ${this.regApps} REGISTERED apps...`);
    try {
      const apps = [];
      let i = 1;

      while (this.config.get<string>(`APP_${i}_NAME`)) {
        apps.push({
          name: this.config.get<string>(`APP_${i}_NAME`),
          url: this.config.get<string>(`APP_${i}_URL`),
          email: this.config.get<string>(`APPS_EMAIL`),
        });
        i++;
      }

      if (apps.length === 0) {
        this.logger.warn('Cannot find app');
      }
      return apps;
    } catch (error) {
      this.logger.error(`Error getting monitored apps: ${error.message}`);
    }
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
