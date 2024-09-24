import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { catchError, lastValueFrom } from 'rxjs';
import { MailerService } from './mailer.service';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class HealthCheckService {
  private readonly logger = new Logger(HealthCheckService.name);

  constructor(
    private readonly httpService: HttpService,
    private readonly mailerService: MailerService,
  ) {}

  private async checkHealth(url: string): Promise<boolean> {
    try {
      const response = await lastValueFrom(
        this.httpService.get(url).pipe(
          catchError(() => {
            throw new Error('Health check failed');
          }),
        ),
      );
      return response.status === 200;
    } catch (error) {
      this.logger.error(`Health check failed for ${url}: ${error.message}`);
      return false;
    }
  }

  @Cron(CronExpression.EVERY_10_SECONDS)
  async monitorApps() {
    this.logger.log('Monitoring apps...');
    const apps = [
      {
        name: 'Pita Dashboard',
        url: 'https://dolphin-app-vfcjw.ondigitalocean.app/',
        email: 'alausakabir0@gmail.com',
      },
      {
        name: 'Facebook',
        url: 'https://www.facebook.com',
      },
      {
        name: 'Recruitment Service',
        url: 'https://transaction-api-1.onrender.com/',
        email: 'alausakabir0@gmail.com',
      },
    ];

    for (const app of apps) {
      let healthy = await this.checkHealth(app.url);
      if (healthy) {
        this.logger.log(`App ${app.name} is up and running!`);
      }

      if (!healthy) {
        this.logger.error(`App ${app.name} is down. Retrying health check...!`);
      }
      for (let i = 0; i < 2 && !healthy; i++) {
        await new Promise((resolve) => setTimeout(resolve, 2000));
        healthy = await this.checkHealth(app.url);
      }

      if (!healthy) {
        this.logger.error(`App ${app.name} is still down. Sending email...!`);
        await this.mailerService.sendMail(app.email, app.name);
      }
    }
  }
}
