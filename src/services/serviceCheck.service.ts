import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
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
    try {
      const serviceData = { ...data, healthStatus: HealthStatus.UP };

      const serviceExists = await this.serviceRepo.getServices();

      if (serviceExists.find((service) => service.url === serviceData.url)) {
        throw new Error('Service already exists');
      }

      const result = this.serviceRepo.addService(serviceData);

      return {
        statusCode: HttpStatus.CREATED,
        message: 'Service registered successfully',
        data: result,
      };
    } catch (error) {
      if (error.message === 'Service already exists') {
        throw new HttpException(
          'Service already exists',
          HttpStatus.BAD_REQUEST,
        );
      }
    }
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

  async deleteService(id: string) {
    this.logger.log(`Deleting service with ID ${id}`);
    const service = await this.serviceRepo.getServiceById(id);
    if (!service) {
      this.logger.error(`Service with ID ${id} not found`);
      throw new Error('Service not found');
    }
    return this.serviceRepo.deleteService(id);
  }
}
