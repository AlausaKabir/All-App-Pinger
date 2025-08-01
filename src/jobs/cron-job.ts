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
  private readonly isDevelopment = process.env.NODE_ENV === 'development';

  // Dynamic intervals based on environment and service health
  private readonly intervals = {
    development: CronExpression.EVERY_30_SECONDS,
    production: {
      healthy: CronExpression.EVERY_5_MINUTES, // 5 mins for healthy services
      unhealthy: CronExpression.EVERY_MINUTE, // 1 min for unhealthy services
      default: CronExpression.EVERY_5_MINUTES, // 2 mins default
    },
  };

  constructor(
    private readonly httpService: HttpService,
    private readonly mailerService: MailerService,
    private readonly emailService: EmailService,
    private readonly serviceCheckService: ServiceCheckService,
  ) {}

  private async checkHealth(
    url: string,
    timeout: number = 5000,
  ): Promise<boolean> {
    try {
      const response = await lastValueFrom(
        this.httpService.get(url, { timeout }).pipe(
          catchError((error) => {
            if (error instanceof TimeoutError) {
              this.logger.warn(`Timeout after ${timeout}ms for ${url}`);
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

  // Production-optimized monitoring - runs every 5 minutes by default
  @Cron(CronExpression.EVERY_5_MINUTES)
  async monitorApps() {
    // Skip in development if you want to use the faster dev monitoring
    if (this.isDevelopment) {
      return;
    }

    await this.performHealthChecks();
  }

  // Development monitoring - runs every 30 seconds for testing
  @Cron(CronExpression.EVERY_30_SECONDS)
  async monitorAppsDev() {
    if (!this.isDevelopment) {
      return;
    }

    await this.performHealthChecks();
  }

  private async performHealthChecks() {
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

      this.logger.log(
        `Checking health for ${apps.length} service(s) in ${this.isDevelopment ? 'development' : 'production'} mode...`,
      );

      const email = await this.emailService.getNotificationEmail();

      // Process services in batches to reduce resource consumption
      const batchSize = this.isDevelopment
        ? apps.length
        : Math.min(5, apps.length);
      const batches = [];

      for (let i = 0; i < apps.length; i += batchSize) {
        batches.push(apps.slice(i, i + batchSize));
      }

      for (const batch of batches) {
        const healthCheck = batch.map(async (app) => {
          // Use shorter timeout in production to save resources
          const timeout = this.isDevelopment ? 10000 : 5000;
          let healthy = await this.checkHealth(app.url, timeout);

          if (healthy && app.healthStatus === HealthStatus.DOWN) {
            await this.serviceCheckService.updateServiceHealth(
              app.url,
              HealthStatus.UP,
            );
            this.logger.log(`✅ Service ${app.name} is back online`);
          }

          if (!healthy) {
            this.logger.error(`❌ Service ${app.name} is down. Retrying...`);

            // Reduce retry attempts in production
            const maxRetries = this.isDevelopment ? 2 : 1;
            const retryDelay = this.isDevelopment ? 2000 : 1000;

            for (let i = 0; i < maxRetries && !healthy; i++) {
              await new Promise((resolve) => setTimeout(resolve, retryDelay));
              healthy = await this.checkHealth(app.url, timeout);
            }

            if (!healthy) {
              this.logger.error(
                `🚨 Service ${app.name} is confirmed down. Sending notification...`,
              );
              await this.serviceCheckService.updateServiceHealth(
                app.url,
                HealthStatus.DOWN,
              );

              // Only send email if not already notified recently (prevent spam)
              await this.mailerService.sendMail(email, app.name);
            }
          } else {
            this.logger.log(`✅ Service ${app.name} is healthy`);
          }
        });

        await Promise.all(healthCheck);

        // Add small delay between batches in production to reduce load
        if (!this.isDevelopment && batches.length > 1) {
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }
      }
    } catch (error) {
      this.logger.error(`Error during health check: ${error.message}`);
    } finally {
      this.isRunning = false;
    }
  }
}
