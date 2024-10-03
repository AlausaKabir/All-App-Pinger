import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { catchError, lastValueFrom, TimeoutError } from 'rxjs';
import { MailerService } from './mailer.service';
import { Cron, CronExpression, Timeout } from '@nestjs/schedule';
import { ConstantsService } from './constants.service';

@Injectable()
export class HealthCheckService {
  private readonly logger = new Logger(HealthCheckService.name);
  private isRunning = false;

  constructor(
    private readonly httpService: HttpService,
    private readonly mailerService: MailerService,
    private readonly constantsService: ConstantsService,
  ) {}

  private async checkHealth(url: string): Promise<boolean> {
    try {
      const response = await lastValueFrom(
        this.httpService.get(url, { timeout: 5000 }).pipe(
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
      const apps = this.constantsService.monitoredApps;
      const healthCheckPromises = apps.map(async (app) => {
        let healthy = await this.checkHealth(app.url);
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
            await this.mailerService.sendMail(app.email, app.name);
          }
        } else {
          this.logger.log(`App ${app.name} is healthy`);
        }
      });

      await Promise.all(healthCheckPromises);
    } catch (error) {
      this.logger.error(`Error during health check: ${error.message}`);
    } finally {
      this.isRunning = false;
    }
  }
}
