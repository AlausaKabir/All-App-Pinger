import { Injectable, Logger } from '@nestjs/common';
import { HealthStatus } from '@prisma/client';
import { ServiceRepository } from 'src/repositories/service-check.repository';

@Injectable()
export class ServiceCheckService {
  private readonly logger = new Logger(ServiceCheckService.name);

  constructor(private readonly serviceRepo: ServiceRepository) {}

  async registerService(data: {
    name: string;
    url: string;
    healthStatus?: HealthStatus;
  }) {
    const serviceData = { ...data, healthStatus: HealthStatus.UP };

    const serviceExists = await this.serviceRepo.getServices();

    if (serviceExists.find((service) => service.url === serviceData.url)) {
      throw new Error('Service already exists');
    }
    return this.serviceRepo.addService(serviceData);
  }

  async getAllServices() {
    const result = await this.serviceRepo.getServices();
    if (!result.length) {
      throw new Error('No services found');
    }
    return result;
  }

  async updateServiceHealth(url: string, healthStatus: HealthStatus) {
    this.logger.log(`Updating health status for ${url} to ${healthStatus}`);
    return this.serviceRepo.updateServiceHealth(url, healthStatus);
  }
}
