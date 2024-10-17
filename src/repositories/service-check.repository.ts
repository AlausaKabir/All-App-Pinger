import {
  ConflictException,
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
} from '@nestjs/common';
import { HealthStatus, Service } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ServiceRepository {
  private readonly logger = new Logger(ServiceRepository.name);
  constructor(private prisma: PrismaService) {}

  async getServices(): Promise<Service[]> {
    return this.prisma.service.findMany();
  }

  async getServiceById(id: string): Promise<Service> {
    this.logger.log(`Getting service with ID ${id}`);
    const service = await this.prisma.service.findUnique({
      where: { id },
    });

    if (!service) {
      throw new Error(`Service with ID ${id} not found`);
    }
    return service;
  }
  async getServiceByUrl(url: string): Promise<Service> {
    const service = await this.prisma.service.findFirst({
      where: { url },
    });

    if (!service) {
      throw new Error(`Service with URL ${url} not found`);
    }
    return service;
  }

  async addService(data: {
    name: string;
    url: string;
    healthStatus: HealthStatus;
  }): Promise<Service> {
    const existingService = await this.prisma.service.findFirst({
      where: { url: data.url },
    });

    if (existingService) {
      throw new HttpException('Service already exists', HttpStatus.BAD_REQUEST);
    }
    throw new HttpException(
      'Failed to register service',
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }

  async updateServiceHealth(url: string, healthStatus: HealthStatus) {
    return this.prisma.service.update({
      where: { url },
      data: { healthStatus },
    });
  }

  async deleteService(id: string) {
    return this.prisma.service.delete({
      where: { id },
    });
  }
}
