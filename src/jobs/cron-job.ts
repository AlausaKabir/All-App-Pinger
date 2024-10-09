import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { catchError, lastValueFrom, TimeoutError } from 'rxjs';
import { MailerService } from '../services/mailer.service';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ServiceCheckService } from 'src/services/serviceCheck.service';
import { EmailService } from 'src/services/email.service';
import { HealthStatus } from '@prisma/client';

@Injectable()
export class CronJobs {
  private readonly logger = new Logger(CronJobs.name);
  private isRunning = false;

  constructor(
    private readonly httpService: HttpService,
    private readonly mailerService: MailerService,
    private readonly emailService: EmailService,
    private readonly serviceCheckService: ServiceCheckService,
  ) {}

  private async checkHealth(url: string): Promise<boolean> {
    try {
      const response = await lastValueFrom(
        this.httpService.get(url, { timeout: 10000 }).pipe(
          catchError((error) => {
            if (error instanceof TimeoutError) {
              this.logger.warn(`No response after timeout for ${url}`);
            }
            throw error;
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
    if (this.isRunning) {
      this.logger.warn(
        'Previous health check is still running. Skipping this cycle...',
      );
      return;
    }

    this.isRunning = true;

    try {
      const apps = await this.serviceCheckService.getAllServices();
      if (!apps.length) {
        this.logger.warn('No apps found to monitor');
        return;
      }
      this.logger.log(`Found and checking for ${apps.length} app(s)...`);

      const email = await this.emailService.getNotificationEmail();

      const healthCheck = apps.map(async (app) => {
        let healthy = await this.checkHealth(app.url);
        if (healthy) {
          await this.serviceCheckService.updateServiceHealth(
            app.url,
            HealthStatus.UP,
          );
        }
        if (!healthy) {
          this.logger.error(`App ${app.name} is down. Trying again...`);

          for (let i = 0; i < 2 && !healthy; i++) {
            await new Promise((resolve) => setTimeout(resolve, 2000));
            healthy = await this.checkHealth(app.url);
          }

          if (!healthy) {
            this.logger.error(
              `App ${app.name} is still down. Sending email...!`,
            );
            await this.serviceCheckService.updateServiceHealth(
              app.url,
              HealthStatus.DOWN,
            );
            await this.mailerService.sendMail(email, app.name);
          }
        } else {
          this.logger.log(`App ${app.name} is healthy`);
        }
      });

      await Promise.all(healthCheck);
    } catch (error) {
      this.logger.error(`Error during health check: ${error.message}`);
    } finally {
      this.isRunning = false;
    }
  }
}
