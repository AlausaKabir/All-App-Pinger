import { Injectable } from '@nestjs/common';

@Injectable()
export class MonitoringConfigService {
  private readonly config = {
    development: {
      healthCheckInterval: 30000, // 30 seconds
      healthCheckTimeout: 10000, // 10 seconds
      maxRetries: 2,
      batchSize: 10,
      retryDelay: 2000,
      enableDetailedLogging: true,
    },
    production: {
      healthCheckInterval: 300000, // 5 minutes
      healthCheckTimeout: 5000, // 5 seconds
      maxRetries: 1,
      batchSize: 5,
      retryDelay: 1000,
      enableDetailedLogging: false,
      emailThrottleMinutes: 30,
      maxEmailsPerHour: 10,
    },
  };

  private readonly isDevelopment = process.env.NODE_ENV === 'development';

  get healthCheckInterval(): number {
    return this.isDevelopment
      ? this.config.development.healthCheckInterval
      : this.config.production.healthCheckInterval;
  }

  get healthCheckTimeout(): number {
    return this.isDevelopment
      ? this.config.development.healthCheckTimeout
      : this.config.production.healthCheckTimeout;
  }

  get maxRetries(): number {
    return this.isDevelopment
      ? this.config.development.maxRetries
      : this.config.production.maxRetries;
  }

  get batchSize(): number {
    return this.isDevelopment
      ? this.config.development.batchSize
      : this.config.production.batchSize;
  }

  get retryDelay(): number {
    return this.isDevelopment
      ? this.config.development.retryDelay
      : this.config.production.retryDelay;
  }

  get enableDetailedLogging(): boolean {
    return this.isDevelopment
      ? this.config.development.enableDetailedLogging
      : this.config.production.enableDetailedLogging;
  }

  get emailThrottleMinutes(): number {
    return this.config.production.emailThrottleMinutes || 30;
  }

  get maxEmailsPerHour(): number {
    return this.config.production.maxEmailsPerHour || 10;
  }

  get isProductionOptimized(): boolean {
    return !this.isDevelopment;
  }

  // Optional: Disable cron jobs entirely
  get cronJobsEnabled(): boolean {
    return process.env.DISABLE_CRON_JOBS !== 'true';
  }

  // Check if external monitoring is used instead
  get useExternalMonitoring(): boolean {
    return process.env.EXTERNAL_MONITORING === 'true';
  }
}
